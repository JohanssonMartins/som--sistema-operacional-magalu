import { aiService } from '../server/services/aiService';
import dotenv from 'dotenv';
dotenv.config();

async function testAI() {
    console.log('API KEY from env:', process.env.GEMINI_API_KEY ? 'Present (starts with ' + process.env.GEMINI_API_KEY.substring(0, 6) + '...)' : 'MISSING');
    try {
        const res = await aiService.suggestAction('Pessoas', 'Reconhecimento', 'Ações de reconhecimento são executadas?', 'Verificar frequência');
        console.log('AI Response:', res);
    } catch (error: any) {
        console.error('AI Test Failed:', error.message);
    }
}

testAI();
