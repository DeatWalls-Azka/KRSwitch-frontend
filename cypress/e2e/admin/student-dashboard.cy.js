describe('Student Dashboard Barter Feed & Filter Hardening', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/socket-token', { statusCode: 200, body: { token: 'mock-socket-token' } });

    cy.intercept('GET', '/api/barter-status', {
      statusCode: 200,
      body: { isBarterEnabled: true }
    });

    // 1. Mock the logged-in student user M0403241117
    cy.intercept('GET', '/api/me', {
      statusCode: 200,
      body: { nim: 'M0403241117', name: 'Gilang Muhamad Widiagung', email: 'gnaligilang@apps.ipb.ac.id', role: 'student' }
    }).as('getMe');

    // 2. Mock Users
    cy.intercept('GET', '/api/users', {
      statusCode: 200,
      body: [
        { nim: 'M0403241117', name: 'Gilang Muhamad Widiagung' },
        { nim: 'M0403241075', name: 'Muh Arifaushan' },
        { nim: 'M0403241029', name: 'Azka Julian' },
        { nim: 'M0403241009', name: 'Indah Lestari' }
      ]
    }).as('getUsers');

    // 3. Mock Parallel Classes
    cy.intercept('GET', '/api/classes', {
      statusCode: 200,
      body: [
        // Course KOM120H (lecture K1 & K2, practice P1 & P2)
        { id: 42, courseCode: 'KOM120H', courseName: 'Analisis Algoritma', classCode: 'K1', day: 'Kamis', timeStart: '08:00', timeEnd: '09:40', room: 'RK A' },
        { id: 43, courseCode: 'KOM120H', courseName: 'Analisis Algoritma', classCode: 'K2', day: 'Kamis', timeStart: '08:00', timeEnd: '09:40', room: 'RK B' },
        { id: 48, courseCode: 'KOM120H', courseName: 'Analisis Algoritma', classCode: 'P1', day: 'Kamis', timeStart: '13:00', timeEnd: '15:00', room: 'Lab A' },
        { id: 47, courseCode: 'KOM120H', courseName: 'Analisis Algoritma', classCode: 'P2', day: 'Kamis', timeStart: '13:00', timeEnd: '15:00', room: 'Lab B' },
        
        // Course KOM1231 (lecture K2, responsi R2)
        { id: 51, courseCode: 'KOM1231', courseName: 'Rekayasa Perangkat Lunak', classCode: 'K2', day: 'Jumat', timeStart: '08:00', timeEnd: '09:40', room: 'RK C' },
        { id: 57, courseCode: 'KOM1231', courseName: 'Rekayasa Perangkat Lunak', classCode: 'R2', day: 'Jumat', timeStart: '13:00', timeEnd: '15:00', room: 'RK D' },
        
        // Course KOM1221 (lecture K2, practice P3)
        { id: 22, courseCode: 'KOM1221', classCode: 'K2', day: 'Senin', timeStart: '08:00', timeEnd: '09:40', room: 'RK E' },
        { id: 25, courseCode: 'KOM1221', classCode: 'P3', day: 'Senin', timeStart: '13:00', timeEnd: '15:00', room: 'Lab C' },
        // A parallel section with a schedule conflict for practice
        { id: 24, courseCode: 'KOM1221', classCode: 'P2', day: 'Kamis', timeStart: '13:00', timeEnd: '15:00', room: 'Lab D' } // Conflicts with KOM120H (P2)!
      ]
    }).as('getClasses');

    // 4. Mock student enrollments (multi-class enrollment)
    cy.intercept('GET', '/api/enrollments', {
      statusCode: 200,
      body: [
        { nim: 'M0403241117', parallelClassId: 43 }, // KOM120H (K2)
        { nim: 'M0403241117', parallelClassId: 47 }, // KOM120H (P2)
        { nim: 'M0403241117', parallelClassId: 51 }, // KOM1231 (K2)
        { nim: 'M0403241117', parallelClassId: 57 }, // KOM1231 (R2)
        { nim: 'M0403241117', parallelClassId: 22 }, // KOM1221 (K2)
        { nim: 'M0403241117', parallelClassId: 25 }, // KOM1221 (P3)
        
        // Other students (offering counterparts)
        { nim: 'M0403241075', parallelClassId: 42 }, // KOM120H (K1)
        { nim: 'M0403241029', parallelClassId: 48 }, // KOM120H (P1)
        { nim: 'M0403241009', parallelClassId: 24 }  // KOM1221 (P2)
      ]
    }).as('getEnrollments');

    // 5. Mock Barter Offers
    cy.intercept('GET', '/api/offers', {
      statusCode: 200,
      body: [
        // Offer 1: seeking KOM120H-K2 (lecture), offering KOM120H-K1. Available for trade!
        {
          id: 101,
          offererNim: 'M0403241075',
          myClassId: 42,
          wantedClassId: 43,
          status: 'open',
          createdAt: new Date().toISOString(),
          offerer: { nim: 'M0403241075', name: 'Muh Arifaushan' },
          myClass: { id: 42, courseCode: 'KOM120H', classCode: 'K1', courseName: 'Analisis Algoritma' },
          wantedClass: { id: 43, courseCode: 'KOM120H', classCode: 'K2', courseName: 'Analisis Algoritma' }
        },
        // Offer 2: seeking KOM120H-P2 (practice), offering KOM120H-P1. Available for trade!
        {
          id: 102,
          offererNim: 'M0403241029',
          myClassId: 48,
          wantedClassId: 47,
          status: 'open',
          createdAt: new Date().toISOString(),
          offerer: { nim: 'M0403241029', name: 'Azka Julian' },
          myClass: { id: 48, courseCode: 'KOM120H', classCode: 'P1', courseName: 'Analisis Algoritma' },
          wantedClass: { id: 47, courseCode: 'KOM120H', classCode: 'P2', courseName: 'Analisis Algoritma' }
        },
        // Offer 3: seeking KOM1221-P3, offering KOM1221-P2.
        // Even though student holds KOM1221-P3, the offered class KOM1221-P2 (Kamis 13:00-15:00)
        // conflicts with student's KOM120H-P2 (Kamis 13:00-15:00). So it is BENTROK/unavailable!
        {
          id: 103,
          offererNim: 'M0403241009',
          myClassId: 24,
          wantedClassId: 25,
          status: 'open',
          createdAt: new Date().toISOString(),
          offerer: { nim: 'M0403241009', name: 'Indah Lestari' },
          myClass: { id: 24, courseCode: 'KOM1221', classCode: 'P2', courseName: 'Struktur Data' },
          wantedClass: { id: 25, courseCode: 'KOM1221', classCode: 'P3', courseName: 'Struktur Data' }
        },
        // Offer 4: Student's own trade offer (seeking something else).
        // Should NOT be shown under FOR YOU list.
        {
          id: 104,
          offererNim: 'M0403241117',
          myClassId: 51,
          wantedClassId: 50,
          status: 'open',
          createdAt: new Date().toISOString(),
          offerer: { nim: 'M0403241117', name: 'Gilang Muhamad Widiagung' },
          myClass: { id: 51, courseCode: 'KOM1231', classCode: 'K2', courseName: 'Rekayasa Perangkat Lunak' },
          wantedClass: { id: 50, courseCode: 'KOM1231', classCode: 'K1', courseName: 'Rekayasa Perangkat Lunak' }
        }
      ]
    }).as('getOffers');

    cy.intercept('GET', '/api/notifications', { statusCode: 200, body: [] });

    // Visit dashboard
    cy.setCookie('token', 'mock-student-token');
    cy.visit('/');
    cy.wait(['@getMe', '@getUsers', '@getClasses', '@getEnrollments', '@getOffers']);
  });

  it('renders all barter offers in the default un-filtered feed', () => {
    // Should show the title and count of all active open offers in the desktop panel
    cy.get('div.hidden.md\\:flex').filter(':contains("PANEL BARTER")').as('desktopPanel');
    cy.get('@desktopPanel').find('h2').contains('PANEL BARTER').should('be.visible');
    cy.get('@desktopPanel').find('h1').contains('4 Penawaran').should('be.visible');
    
    cy.get('@desktopPanel').within(() => {
      cy.contains('Muh Arifaushan').should('exist');
      cy.contains('Azka Julian').should('exist');
      cy.contains('Indah Lestari').should('exist');
    });
  });

  it('correctly maps multi-class parallel sections (both lecture & practice) for highlight', () => {
    // Click course tab first
    cy.contains('button', 'KOM120H').click();

    // Under course KOM120H, both K2 (lecture) and P2 (practice) should be active user classes.
    // 1. By default, session type is Kuliah. Gilang has K2, so K2 parallel card should render the "YOU" label.
    cy.contains('h3', 'K2').parents('.bg-green-100').should('contain', 'YOU');

    // 2. Select PRAKTIKUM session type. Gilang has P2, so P2 parallel card should render the "YOU" label.
    cy.contains('button', 'PRAKTIKUM (P)').click();
    cy.contains('h3', 'P2').parents('.bg-green-100').should('contain', 'YOU');
  });

  it('filters offers for student when UNTUKMU filter is activated, removing bentrok and own offers', () => {
    cy.get('div.hidden.md\\:flex').filter(':contains("PANEL BARTER")').as('desktopPanel');

    // Activate the "UNTUKMU" filter in the desktop panel
    cy.get('@desktopPanel').contains('button', 'UNTUKMU').click();

    // 1. Total offers should be filtered down to exactly 2 (Offer 1 & Offer 2)
    cy.get('@desktopPanel').find('h1').contains('2 Penawaran').should('be.visible');

    cy.get('@desktopPanel').within(() => {
      cy.contains('Muh Arifaushan').should('exist'); // Seeking K2, which student holds (Lecture)
      cy.contains('Azka Julian').should('exist');     // Seeking P2, which student holds (Practice)

      // 2. Offer 3 (Indah Lestari - P2) has schedule conflict and must be filtered out
      cy.contains('Indah Lestari').should('not.exist');

      // 3. Offer 4 (student's own offer) must be filtered out
      cy.contains('Gilang Muhamad Widiagung').should('not.exist');
    });
  });
  it('filters offers correctly even when parallelClassId is received as a string (type mismatch resilience)', () => {
    // Override the getEnrollments intercept with string IDs to simulate type mismatch
    cy.intercept('GET', '/api/enrollments', {
      statusCode: 200,
      body: [
        { nim: 'M0403241117', parallelClassId: '43' }, // KOM120H (K2) - notice the string '43' instead of number 43
        { nim: 'M0403241117', parallelClassId: '47' }, // KOM120H (P2)
        { nim: 'M0403241117', parallelClassId: '51' }, // KOM1231 (K2)
        { nim: 'M0403241117', parallelClassId: '57' }, // KOM1231 (R2)
        { nim: 'M0403241117', parallelClassId: '22' }, // KOM1221 (K2)
        { nim: 'M0403241117', parallelClassId: '25' }, // KOM1221 (P3)
      ]
    }).as('getEnrollmentsString');

    // Visit dashboard again to trigger the new intercept
    cy.visit('/');
    cy.wait(['@getMe', '@getUsers', '@getClasses', '@getEnrollmentsString', '@getOffers']);

    cy.get('div.hidden.md\\:flex').filter(':contains("PANEL BARTER")').as('desktopPanel');

    // Activate the "UNTUKMU" filter
    cy.get('@desktopPanel').contains('button', 'UNTUKMU').click();

    // 1. Should still successfully match classes despite string vs number mismatch
    cy.get('@desktopPanel').find('h1').contains('2 Penawaran').should('be.visible');

    cy.get('@desktopPanel').within(() => {
      // Offer 1 & 2 should exist because myEnrollmentMap and hasScheduleConflict 
      // successfully parsed the string IDs with loose equality (==).
      cy.contains('Muh Arifaushan').should('exist');
      cy.contains('Azka Julian').should('exist');
      
      // Offer 3 conflicts and Offer 4 is own offer
      cy.contains('Indah Lestari').should('not.exist');
      cy.contains('Gilang Muhamad Widiagung').should('not.exist');
    });
  });

  it('passes real-time enrollments to CreateOfferModal instead of fetching stale data', () => {
    cy.get('div.hidden.md\\:flex').filter(':contains("PANEL BARTER")').as('desktopPanel');

    // Open the create offer modal
    // Open the create offer modal
    cy.get('@desktopPanel').contains('button', 'Buat Penawaran Barter').click();

    // The modal should appear
    cy.contains('h3', 'Buat Penawaran Baru').should('be.visible');

    // It should NOT display Loading state
    cy.contains('label', 'Kelas Saya').parent().find('button').should('not.contain', '-- Memuat...');

    // Close the modal
    cy.get('button[aria-label="Close modal"]').click();
  });
});
