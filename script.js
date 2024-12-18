const mp = new MercadoPago('TEST-1662793b-83e8-42bd-8f75-cf6f3a2fd5c0', {
    locale: 'pt-BR'
    });
    
    // Função para exibir o formulário selecionado
    function showForm(paymentType) {
    document.getElementById('pixForm').style.display = 'none';
    document.getElementById('creditCardForm').style.display = 'none';
    document.getElementById('debitCardForm').style.display = 'none';
    
    if (paymentType === 'pix') {
    document.getElementById('pixForm').style.display = 'block';
    } else if (paymentType === 'creditCard') {
    document.getElementById('creditCardForm').style.display = 'block';
    } else if (paymentType === 'debitCard') {
    document.getElementById('debitCardForm').style.display = 'block';
    }
    }
    
    // Função para gerar o QR Code
    function generateQRCode(pixKey) {
    const qrcodeContainer = document.getElementById('qrcode');
    qrcodeContainer.innerHTML = ''; // Limpa o QR Code anterior
    new QRCode(qrcodeContainer, {
    text: pixKey,
    width: 250,
    height: 250,
    });
    
    // Preenche a chave Pix no campo de texto
    document.getElementById('pixKeyDisplay').value = pixKey;
    
    // Exibe o container da chave Pix e do botão de copiar
    document.getElementById('pixKeyContainer').style.display = 'block';
    }
    
    // Função para copiar a chave Pix
    function copyPixKey() {
    const pixKeyInput = document.getElementById('pixKeyDisplay');
    pixKeyInput.select();
    document.execCommand('copy');
    alert('Chave Pix copiada!');
    }
    
    
    // Envio do formulário de Pix
    document.getElementById('pixForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const cpf = document.getElementById('cpfPix').value;
    
    try {
    // Faz a requisição para o servidor para gerar a chave Pix
    const response = await fetch('https://rcwifi-payment-server.sv1o3q.easypanel.host/generate-pix', {
       method: 'POST',
       headers: {
           'Content-Type': 'application/json'
       },
       body: JSON.stringify({ cpf })
    });
    
    if (!response.ok) {
       throw new Error('Erro ao gerar o pagamento Pix');
    }
    
    const data = await response.json();
    const pixKey = data.pixCode;
    
    // Gera o QR Code com a chave Pix recebida
    generateQRCode(pixKey);
    } catch (error) {
    console.error('Erro ao gerar o pagamento Pix:', error);
    alert('Erro ao gerar o pagamento Pix. Tente novamente.');
    }
    });
    
    // Função para limpar os dados de entrada (remover espaços, pontos e caracteres especiais)
function sanitizeInput(input) {
return input.replace(/\D/g, ''); // Remove tudo que não é número
}

// Função para detectar a bandeira do cartão via API do Mercado Pago
function detectCardBrand(bin) {
    const binNumber = parseInt(bin.substring(0, 6));

    if (/^4/.test(bin)) {
        return 'visa';
    } else if (/^5[1-5]/.test(bin) || (binNumber >= 2221 && binNumber <= 2720)) {
        return 'master';
    } else if (/^3[47]/.test(bin)) {
        return 'amex';
    } else if (/^3(?:0[0-5]|[68])/.test(bin)) {
        return 'diners';
    } else if (/^6011/.test(bin) || (binNumber >= 622126 && binNumber <= 622925) || /^64[4-9]/.test(bin) || /^65/.test(bin)) {
        return 'discover';
    } else if (/^35(?:2[89]|[3-8][0-9])/.test(bin)) {
        return 'jcb';
    } else if (/^(636368|438935|504175|451416|636297)/.test(bin)) {
        return 'elo';
    } else if (/^(606282|384100)/.test(bin)) {
        return 'hipercard';
    } else {
        return null; // Retorna null se a bandeira não for detectada
    }
}







// Envio do formulário de Cartão de Crédito
document.getElementById('creditCardForm').addEventListener('submit', function(event) {
    event.preventDefault();

    let cardNumber = sanitizeInput(document.getElementById('cardNumber').value);
    const cardExpirationMonth = sanitizeInput(document.getElementById('cardExpirationMonth').value);
    const cardExpirationYear = sanitizeInput(document.getElementById('cardExpirationYear').value);
    const cardholderName = document.getElementById('cardholderName').value;
    const securityCode = sanitizeInput(document.getElementById('securityCode').value);
    const email = document.getElementById('emailCredit').value;
    const cpf = sanitizeInput(document.getElementById('cpf').value);

    // Detecta a bandeira do cartão
    const paymentMethodId = detectCardBrand(cardNumber);
    console.log('Bandeira detectada:', paymentMethodId);

    if (paymentMethodId === 'Bandeira desconhecida') {
        alert('Bandeira do cartão não identificada. Verifique os dados e tente novamente.');
        return;
    }

    // Cria o token do cartão com o Mercado Pago
    mp.createCardToken({
        cardNumber,
        cardExpirationMonth,
        cardExpirationYear,
        securityCode,
        cardholderName
    }).then(function(response) {
        processPayment({ token: response.id, payment_method_id: paymentMethodId, email, cpf });
    }).catch(function(error) {
        console.error('Erro ao criar o token:', error);
        alert('Erro ao criar o token do cartão.');
    });
});


// Envio do formulário de Cartão de Débito
// Envio do formulário de Cartão de Débito
document.getElementById('debitCardForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Captura e sanitiza os dados do formulário
    let cardNumber = sanitizeInput(document.getElementById('debitCardNumber').value);
    const cardExpirationMonth = sanitizeInput(document.getElementById('debitCardExpirationMonth').value);
    const cardExpirationYear = sanitizeInput(document.getElementById('debitCardExpirationYear').value);
    const cardholderName = document.getElementById('debitCardholderName').value;
    const securityCode = sanitizeInput(document.getElementById('debitSecurityCode').value);
    const email = document.getElementById('emailDebit').value;
    const cpf = sanitizeInput(document.getElementById('cpfDebit').value);

    // Detecta a bandeira do cartão
    const paymentMethodId = detectCardBrand(cardNumber);
    console.log('Bandeira detectada:', paymentMethodId);

    // Verifica se a bandeira foi detectada corretamente
    if (paymentMethodId === 'Bandeira desconhecida') {
        alert('Bandeira do cartão não identificada. Verifique os dados e tente novamente.');
        return;
    }

    // Cria o token do cartão com o Mercado Pago
    mp.createCardToken({
        cardNumber,
        cardExpirationMonth,
        cardExpirationYear,
        securityCode,
        cardholderName
    }).then(function(response) {
        console.log('Token criado:', response.id);
        processPayment({ token: response.id, payment_method_id: paymentMethodId, email, cpf });
    }).catch(function(error) {
        console.error('Erro ao criar o token:', error);
        alert('Erro ao criar o token do cartão de débito.');
    });
});

// Função para processar o pagamento
function processPayment(paymentData) {
    const { token, payment_method_id, email, cpf } = paymentData;

    const data = {
        transaction_amount: 100,
        description: 'Descrição do produto',
        installments: 1,
        token: token,
        payment_method_id: payment_method_id, // Certifique-se de que este campo está sendo passado corretamente
        payer: {
            email: email,
            identification: {
                type: 'CPF',
                number: cpf
            }
        }
    };

    console.log('Dados da requisição:', data); // Log para depurar a requisição

    fetch('https://rcwifi-payment-server.sv1o3q.easypanel.host/process-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Pagamento processado:', data);
        alert('Pagamento realizado com sucesso!');
    })
    .catch(error => {
        console.error('Erro ao processar pagamento:', error);
        alert('Erro ao processar o pagamento.');
    });
}


    
    
    
    