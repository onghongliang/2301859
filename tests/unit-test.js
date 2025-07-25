const request = require('supertest');
const expect = require('chai').expect;
const app = require('../server');

describe('Search Form Tests', () => {
    it('should return home page', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).to.equal(200);
        expect(res.text).to.include('Search Form');
    });

    it('should detect XSS attempt', async () => {
        const res = await request(app)
            .post('/search')
            .type('form')
            .send({ searchTerm: '<script>alert(1)</script>' })
            .redirects(0);
        
        expect(res.statusCode).to.equal(302); // Should redirect back to home
    });

    it('should detect SQL injection attempt', async () => {
        const res = await request(app)
            .post('/search')
            .type('form')
            .send({ searchTerm: "1' OR '1'='1" })
            .redirects(0);
        
        expect(res.statusCode).to.equal(302); // Should redirect back to home
    });

    it('should accept safe search term', async () => {
        const res = await request(app)
            .post('/search')
            .type('form')
            .send({ searchTerm: 'safe search term' });
        
        expect(res.statusCode).to.equal(200);

        expect(res.text).to.include('safe search term');
    });
});