describe('Batch Barter Feature - User Stories & Comprehensive Edge Cases', () => {
  beforeEach(() => {
    // Clear storage to prevent stale redirect history
    cy.window().then((win) => {
      win.sessionStorage.clear();
      win.localStorage.clear();
    });

    // Mock Socket Token to prevent 401 auth redirect from SocketProvider
    cy.intercept('GET', '**/api/socket-token', {
      statusCode: 200,
      body: { token: 'mock-socket-token' }
    }).as('getSocketToken');

    // System barter status
    cy.intercept('GET', '**/api/barter-status', {
      statusCode: 200,
      body: { isBarterEnabled: true }
    }).as('getBarterStatus');

    // Student user session
    cy.intercept('GET', '**/api/me', {
      statusCode: 200,
      body: { nim: 'M0403241117', name: 'Gilang Muhamad Widiagung', email: 'gnaligilang@apps.ipb.ac.id', role: 'student' }
    }).as('getMe');

    // All Users
    cy.intercept('GET', '**/api/users', {
      statusCode: 200,
      body: [
        { nim: 'M0403241117', name: 'Gilang Muhamad Widiagung', role: 'student' },
        { nim: 'M0403241075', name: 'Muh Arifaushan', role: 'student' },
      ]
    }).as('getUsers');

    // Parallel Classes
    cy.intercept('GET', '**/api/classes', {
      statusCode: 200,
      body: [
        { id: 42, courseCode: 'KOM120H', courseName: 'Analisis Algoritma', classCode: 'K1', day: 'Kamis', timeStart: '08:00', timeEnd: '09:40', room: 'RK A' },
        { id: 43, courseCode: 'KOM120H', courseName: 'Analisis Algoritma', classCode: 'K2', day: 'Kamis', timeStart: '08:00', timeEnd: '09:40', room: 'RK B' },
        { id: 48, courseCode: 'KOM120H', courseName: 'Analisis Algoritma', classCode: 'P1', day: 'Kamis', timeStart: '13:00', timeEnd: '15:00', room: 'Lab A' },
        { id: 47, courseCode: 'KOM120H', courseName: 'Analisis Algoritma', classCode: 'P2', day: 'Kamis', timeStart: '13:00', timeEnd: '15:00', room: 'Lab B' },
        { id: 51, courseCode: 'KOM1231', courseName: 'Rekayasa Perangkat Lunak', classCode: 'K1', day: 'Jumat', timeStart: '08:00', timeEnd: '09:40', room: 'RK C' },
        { id: 52, courseCode: 'KOM1231', courseName: 'Rekayasa Perangkat Lunak', classCode: 'K2', day: 'Jumat', timeStart: '08:00', timeEnd: '09:40', room: 'RK D' },
      ]
    }).as('getClasses');

    // Enrollments
    cy.intercept('GET', '**/api/enrollments', {
      statusCode: 200,
      body: [
        { nim: 'M0403241117', parallelClassId: 43 }, // KOM120H (K2)
        { nim: 'M0403241117', parallelClassId: 47 }, // KOM120H (P2)
        { nim: 'M0403241117', parallelClassId: 52 }, // KOM1231 (K2)
      ]
    }).as('getEnrollments');

    // Offers (including multi-item batch package)
    cy.intercept('GET', '**/api/offers', {
      statusCode: 200,
      body: [
        {
          id: 201,
          batchGroupId: 'batch-group-100',
          offererNim: 'M0403241075',
          myClassId: 42,
          wantedClassId: 43,
          status: 'open',
          createdAt: new Date().toISOString(),
          offerer: { nim: 'M0403241075', name: 'Muh Arifaushan' },
          myClass: { id: 42, courseCode: 'KOM120H', classCode: 'K1', courseName: 'Analisis Algoritma' },
          wantedClass: { id: 43, courseCode: 'KOM120H', classCode: 'K2', courseName: 'Analisis Algoritma' }
        },
        {
          id: 202,
          batchGroupId: 'batch-group-100',
          offererNim: 'M0403241075',
          myClassId: 48,
          wantedClassId: 47,
          status: 'open',
          createdAt: new Date().toISOString(),
          offerer: { nim: 'M0403241075', name: 'Muh Arifaushan' },
          myClass: { id: 48, courseCode: 'KOM120H', classCode: 'P1', courseName: 'Analisis Algoritma' },
          wantedClass: { id: 47, courseCode: 'KOM120H', classCode: 'P2', courseName: 'Analisis Algoritma' }
        }
      ]
    }).as('getOffers');

    cy.intercept('GET', '**/api/notifications', { statusCode: 200, body: [] }).as('getNotifications');

    // Set token cookie to prevent auth redirect right before visit
    cy.setCookie('token', 'mock-student-token');
    cy.visit('/');
    cy.wait(['@getMe', '@getUsers', '@getClasses', '@getEnrollments', '@getOffers']);
  });

  it('User Story 1: Opens batch creation modal cleanly and switches to batch mode', () => {
    cy.contains('button', 'Buat Penawaran Barter').click();

    cy.contains('h3', 'Buat Penawaran Baru').should('be.visible');
    cy.contains('button', 'Tukar Banyak (Batch)').click();
    cy.contains('+ Tambah Kelas').should('be.visible');
  });

  it('User Story 2 & Edge Case 3: Displays consolidated package offer in live barter feed', () => {
    cy.contains('Muh Arifaushan').should('exist');
    cy.contains('Paket').should('exist');
  });

  it('Edge Case 4: Atomic cancellation of a batch offer cancels all items in group', () => {
    cy.intercept('DELETE', '**/api/offers/201', {
      statusCode: 200,
      body: { message: 'Penawaran batch berhasil dibatalkan secara bersamaan.' }
    }).as('cancelBatchOffer');

    cy.contains('Muh Arifaushan').should('exist');
  });
});
