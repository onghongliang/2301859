const express = require('express');
const helmet = require('helmet');
const app = express();
const bodyParser = require('body-parser');

// Security middleware
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files
app.use(express.static('public'));

// Input validation functions
function isXSS(input) {
    const xssPatterns = [
        /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<\w+.*?>.*?<\/\w+>/gi
    ];
    return xssPatterns.some(pattern => pattern.test(input));
}

function isSQLInjection(input) {
    const sqlPatterns = [
        /(['";]|(--)|(\/\*)|(\*\/)|(xp_)|(exec)|(union)|(select)|(insert)|(update)|(delete)|(drop)|(alter)|(create))/gi
    ];
    return sqlPatterns.some(pattern => pattern.test(input));
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/search', (req, res) => {
    const searchTerm = req.body.searchTerm || '';
    
    if (isXSS(searchTerm)) {
        console.log('XSS attempt detected');
        return res.redirect('/');
    }
    
    if (isSQLInjection(searchTerm)) {
        console.log('SQL injection attempt detected');
        return res.redirect('/');
    }
    
    // Safe search term
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Search Results</title>
        </head>
        <body>
            <h1>Search Results</h1>
            <p>You searched for: ${searchTerm.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            <a href="/">Back to Home</a>
        </body>
        </html>
    `);
});

// Start server
const PORT = 3000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;