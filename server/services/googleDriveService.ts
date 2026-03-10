import { google, drive_v3 } from 'googleapis';
import stream from 'stream';

import fs from 'fs';
import path from 'path';

// O ID da Pasta Raiz que recebemos do usuário
const ROOT_FOLDER_ID = '0AMJjgmWWqgsOUk9PVA';

// Credenciais puxadas do JSON (local) ou Variável de Ambiente (Produção)
let credentials: any;

if (process.env.GOOGLE_CREDENTIALS) {
    try {
        credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    } catch (e) {
        console.error("Erro ao parsear GOOGLE_CREDENTIALS:", e);
    }
} else {
    // Tenta ler o arquivo local se não tiver na env
    try {
        const filePath = path.join(process.cwd(), 'som-sistema-operacional-magalu-b93bcdee0bff.json');
        const fileContent = fs.readFileSync(filePath, 'utf8');
        credentials = JSON.parse(fileContent);
    } catch (e) {
        console.warn("Arquivo de credenciais do Google Drive não encontrado localmente.");
    }
}

// Iniciar a autenticação
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

export const googleDriveService = {

    /**
     * Busca uma pasta pelo nome dentro de uma pasta pai.
     * Se não existir, cria e retorna o ID dela.
     */
    async getOrCreateFolder(folderName: string, parentId: string): Promise<string> {
        try {
            // 1. Procurar pela pasta
            const query = `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
            const response = await drive.files.list({
                q: query,
                fields: 'files(id, name)',
                spaces: 'drive',
                supportsAllDrives: true,
                includeItemsFromAllDrives: true
            });

            if (response.data.files && response.data.files.length > 0) {
                // A pasta já existe
                return response.data.files[0].id!;
            }

            // 2. Não existe, então vamos criar
            const fileMetadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentId]
            };

            const folder = await drive.files.create({
                requestBody: fileMetadata,
                fields: 'id',
                supportsAllDrives: true
            });

            return folder.data.id!;
        } catch (error) {
            console.error(`Erro ao buscar ou criar a pasta: ${folderName}`, error);
            throw error;
        }
    },

    /**
     * Garante toda a estrutura de pastas Mês > Pilar > Bloco > Pergunta
     */
    async resolveFolderPath(mesAno: string, pilar: string, bloco: string, pergunta: string): Promise<string> {
        const limpaNome = (str: string) => str.substring(0, 50).replace(/[\\/:*?"<>|]/g, '');

        const mesId = await this.getOrCreateFolder(limpaNome(mesAno), ROOT_FOLDER_ID);
        const pilarId = await this.getOrCreateFolder(limpaNome(pilar), mesId);
        const blocoId = await this.getOrCreateFolder(limpaNome(bloco), pilarId);
        const perguntaId = await this.getOrCreateFolder(limpaNome(pergunta), blocoId);

        return perguntaId;
    },

    /**
     * Faz o upload físico de um arquivo buffer e retorna a URL permanente
     */
    async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string, parentFolderId: string): Promise<string> {
        const bufferStream = new stream.PassThrough();
        bufferStream.end(fileBuffer);

        // Fazemos upload e pedimos o webViewLink
        const media = {
            mimeType: mimeType,
            body: bufferStream,
        };

        const fileMetadata = {
            name: fileName,
            parents: [parentFolderId],
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink, webContentLink',
            supportsAllDrives: true
        });

        // É preciso garantir que todos tenham permissão de leitura nesse arquivo caso o root não propague
        // (Apenas de precaução, usualmente o diretório parent já aplica permissão, mas o Google Drives Service Account é chato as vezes).
        await drive.permissions.create({
            fileId: response.data.id!,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            },
            supportsAllDrives: true
        });

        return response.data.webViewLink!;
    }
};
