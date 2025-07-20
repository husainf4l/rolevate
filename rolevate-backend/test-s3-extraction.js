
      const { extractTextFromCV } = require('./dist/utils/cv-text-extractor');
      
      extractTextFromCV('https://4wk-garage-media.s3.me-central-1.amazonaws.com/cvs/anonymous/df61131a-cfc5-47da-af74-bea8678ffa22.pdf')
        .then(text => {
          console.log('✅ Text extraction from S3 successful!');
          console.log('📊 Text length:', text.length);
          console.log('📄 Text preview (first 200 chars):');
          console.log(text.substring(0, 200) + '...');
        })
        .catch(error => {
          console.error('❌ Text extraction failed:', error.message);
        });
    