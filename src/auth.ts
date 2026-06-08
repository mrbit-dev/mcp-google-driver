import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const CREDENTIALS_PATH = process.env.CREDENTIALS_PATH || 'credentials.json';
const TOKEN_PATH = process.env.TOKEN_PATH || 'token.json';

async function authorize() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error(`Error: File ${CREDENTIALS_PATH} khong ton tai. Vui long tai credentials.json tu Google Cloud Console va dat vao thu muc du an.`);
    process.exit(1);
  }

  const credentialsContent = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
  const credentials = JSON.parse(credentialsContent);
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web || {};
  
  if (!client_id || !client_secret) {
    console.error('Error: File credentials.json khong hop le.');
    process.exit(1);
  }

  const redirectUri = redirect_uris ? redirect_uris[0] : 'http://localhost';
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUri);

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });

  console.log('\n=== XAC THUC GOOGLE DRIVE ===');
  console.log('1. Mo duong dan sau trong trinh duyet cua ban:');
  console.log('\x1b[36m%s\x1b[0m', authUrl);
  console.log('\n2. Sau khi dang nhap va dong y, ban se duoc chuyen huong den mot trang (vi du localhost hoac co loi ket noi).');
  console.log('3. Hay copy toan bo URL cua trang do hoac tham so "code=..." va dan vao day.');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('\nNhap code hoac URL redirect: ', async (input) => {
    rl.close();
    let code = input.trim();
    
    // Thu trich xuat code neu nguoi dung nhap ca URL
    try {
      if (code.includes('code=')) {
        const urlObj = new URL(code.startsWith('http') ? code : `http://localhost${code.startsWith('?') ? '' : '/'}${code}`);
        const codeParam = urlObj.searchParams.get('code');
        if (codeParam) {
          code = codeParam;
        }
      }
    } catch (e) {
      // Bo qua neu khong phai URL hop le, giu nguyen chuoi code ban dau
    }

    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
      console.log(`\n\x1b[32mThanh cong! Da luu token tai: ${TOKEN_PATH}\x1b[0m`);
    } catch (err) {
      console.error('Loi khi lay access token:', err);
    }
  });
}

authorize().catch(console.error);
