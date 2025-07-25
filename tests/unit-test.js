const request = require('supertest');
const app = require('../server');

describe('Search Form Tests', () => {
    it('should return home page', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('Search Form');
    });

    it('should detect XSS attempt', async () => {
        const res = await request(app)
            .post('/search')
            .send({ searchTerm: '<script>alert(1)</script>' });
        
        expect(res.statusCode).toEqual(302); // Should redirect back to home
    });

    it('should detect SQL injection attempt', async () => {
        const res = await request(app)
            .post('/search')
            .send({ searchTerm: "1' OR '1'='1" });
        
        expect(res.statusCode).toEqual(302); // Should redirect back to home
    });

    it('should accept safe search term', async () => {
        const res = await request(app)
            .post('/search')
            .send({ searchTerm: 'safe search term' });
        
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('safe search term');
    });
});