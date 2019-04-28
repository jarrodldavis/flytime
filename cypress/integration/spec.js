describe('Sapper template app', function() {
	beforeEach(function() {
		cy.visit('/');
	});

	it('has the correct <h1>', function() {
		cy.contains('h1', 'Great success!');
	});

	it('navigates to /about', function() {
		cy.get('nav a')
			.contains('about')
			.click();
		cy.url().should('include', '/about');
	});

	it('navigates to /blog', function() {
		cy.get('nav a')
			.contains('blog')
			.click();
		cy.url().should('include', '/blog');
	});
});
