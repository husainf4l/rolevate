// Quick token verification from logs
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFsLWh1c3NlaW5AcGFwYXlhdHJhZGluZy5jb20iLCJzdWIiOiJjbWRnaXJtc2MwMDAxajZobW8ydDdxNmlkIiwidXNlclR5cGUiOiJDT01QQU5ZIiwiaWF0IjoxNzU1MTU5NjcwLCJleHAiOjE3NTUxNjY4NzB9.2l1mZyiYelXYt4cNZK3SV1m4gQcwOAlr3UsjymVdx_c';

const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

console.log('🔍 Token Analysis from Production Logs:');
console.log('iat (issued at):', payload.iat, '→', new Date(payload.iat * 1000).toISOString());
console.log('exp (expires at):', payload.exp, '→', new Date(payload.exp * 1000).toISOString());

const durationSeconds = payload.exp - payload.iat;
const durationHours = durationSeconds / 3600;

console.log('Duration:', durationSeconds, 'seconds =', durationHours, 'hours');

if (durationHours === 2) {
    console.log('✅ CONFIRMED: Token duration is EXACTLY 2 hours');
} else {
    console.log('❌ Token duration is', durationHours, 'hours (expected 2)');
}
