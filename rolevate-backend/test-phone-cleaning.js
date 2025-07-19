// Test phone number cleaning for WhatsApp template
function testPhoneCleaning() {
    console.log('🧪 Testing Phone Number Cleaning\n');
    
    const testPhones = [
        '+962796026659',
        '962796026659',
        '+962 796 026 659',
        '962-796-026-659',
        '+962 (796) 026-659',
        ' +962796026659 '
    ];
    
    testPhones.forEach(phone => {
        // Clean phone number (remove + and any spaces/special chars)
        const cleanPhone = phone.replace(/[\+\s\-\(\)]/g, '');
        
        const queryParams = `?phone=${cleanPhone}&jobId=test123&roomName=room456`;
        const finalUrl = `https://rolevate.com/room${queryParams}`;
        
        console.log(`Original: "${phone}"`);
        console.log(`Cleaned:  "${cleanPhone}"`);
        console.log(`URL:      ${finalUrl}`);
        console.log('---');
    });
}

testPhoneCleaning();
