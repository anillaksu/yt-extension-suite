import https from 'https';

function checkUrl(url) {
  https.get(url, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('=== URL:', url, '===');
      console.log('Status:', res.statusCode);
      console.log('Headers:', res.headers);
      console.log('Body length:', body.length);
      console.log('First 500 chars:\n', body.substring(0, 500));
      
      const lemonLinks = body.match(/https?:\/\/[^\s"'<>]*lemon[^\s"'<>]*/gi) || [];
      console.log('Lemon links found:', lemonLinks);

      const scripts = body.match(/<script[^>]*src=["']([^"']+)["'][^>]*>/gi) || [];
      console.log('Scripts:', scripts);
    });
  }).on('error', (err) => {
    console.error('Error fetching', url, err.message);
  });
}

checkUrl('https://www.forfor.site/store');
checkUrl('https://forfor.site/store');
checkUrl('https://anillaksu.github.io/yt-extension-suite/store/');
