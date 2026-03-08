async function testAPI() {
    const url = 'https://som-sistema-operacional-magalu-production.up.railway.app/api/users';
    console.log(`Testando GET: ${url}`);

    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log('Status HTTP:', res.status);
        console.log('Dados recebidos:', data.length, 'usuários encontrados');
        if (data.length > 0) {
            console.log('Exemplo 1º usuário:', data[0].email);
        }
    } catch (e) {
        console.error('Erro na requisição:', e);
    }
}

testAPI();
