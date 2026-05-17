describe('Student Notifications E2E Flow', () => {
  const student = { nim: 'M123', name: 'Student Name', email: 'student@apps.ipb.ac.id', role: 'student' };
  
  const mockNotifications = [
    {
      id: 1,
      recipientNim: 'M123',
      type: 'admin_enrollment_updated',
      read: false,
      createdAt: new Date().toISOString(),
      data: {
        courseCode: 'CS101',
        oldClassCode: 'K01',
        newClassCode: 'K02'
      }
    },
    {
      id: 2,
      recipientNim: 'M123',
      type: 'barter_auto_matched',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      data: {
        yourOldClass: { courseCode: 'CS102', classCode: 'K01' },
        yourNewClass: { courseCode: 'CS102', classCode: 'K03' },
        counterpartName: 'Alice'
      }
    },
    {
      id: 3,
      recipientNim: 'M123',
      type: 'admin_barter_cancelled',
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      data: {
        courseCode: 'CS103',
        classCode: 'K02'
      }
    }
  ];

  const mockClasses = [
    {
      id: 1,
      courseCode: 'CS101',
      courseName: 'Intro to CS',
      classCode: 'K01',
      day: 'Senin',
      timeStart: '08:00',
      timeEnd: '10:00',
      room: 'Room A'
    }
  ];

  beforeEach(() => {
    cy.intercept('GET', '/api/me', { statusCode: 200, body: student }).as('getMe');
    cy.intercept('GET', '/api/notifications', { statusCode: 200, body: mockNotifications }).as('getNotifications');
    cy.intercept('PATCH', '/api/notifications/read-all', { statusCode: 200, body: { message: 'All notifications marked as read' } }).as('readAllNotifications');
    
    // Stub other dashboard-specific endpoints to prevent error logging
    cy.intercept('GET', '/api/users', { statusCode: 200, body: [] });
    cy.intercept('GET', '/api/classes', { statusCode: 200, body: mockClasses });
    cy.intercept('GET', '/api/enrollments', { statusCode: 200, body: [] });
    cy.intercept('GET', '/api/offers', { statusCode: 200, body: [] });
    cy.intercept('GET', '/api/socket-token', { statusCode: 200, body: { token: 'mock-socket-token' } });

    cy.visit('/');
    cy.wait(['@getMe', '@getNotifications']);
  });

  it('renders notification badge with correct unread count', () => {
    // Unread count should be 2 (mockNotifications has two unread notifications)
    cy.get('button[aria-label="Notifications"]:visible').within(() => {
      cy.contains('2').should('be.visible');
    });
  });

  it('opens notification modal when bell button is clicked and displays all notifications', () => {
    cy.get('button[aria-label="Notifications"]:visible').click();

    // The modal should display
    cy.contains('History Inbox').should('be.visible');

    // Confirm that all three notifications render correctly
    cy.contains('Jadwal Diubah').should('be.visible');
    cy.contains('Auto-Match Berhasil').should('be.visible');
    cy.contains('Penawaran Dibatalkan').should('be.visible');

    // Confirm counterpart and class detail formatting
    cy.contains('CS101').should('be.visible');
    cy.contains('Alice').should('be.visible');
    cy.contains('Dibatalkan oleh Admin').should('be.visible');
  });

  it('marks all notifications as read and clears the badge when modal is closed', () => {
    cy.get('button[aria-label="Notifications"]:visible').click();
    cy.contains('History Inbox').should('be.visible');

    // Click Close button on the modal (top right corner x icon)
    cy.get('button[aria-label="Tutup notifikasi"]').click();

    // Verify PATCH /read-all was called
    cy.wait('@readAllNotifications');

    // Badge should be gone or not contain unread count
    cy.get('button[aria-label="Notifications"]:visible').within(() => {
      cy.get('span').should('not.exist');
    });
  });
});
