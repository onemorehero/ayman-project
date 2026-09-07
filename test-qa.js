// Comprehensive QA Test Script for Egyptian Service Marketplace API
import http from 'http';

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING QA TESTS ===');
  let failures = [];
  let passes = 0;

  function assert(condition, message) {
    if (condition) {
      passes++;
      console.log('  PASS: ' + message);
    } else {
      failures.push(message);
      console.error('  FAIL: ' + message);
    }
  }

  try {
    // 1. Health check
    console.log('\n--- 1. Health Check ---');
    const health = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET'
    });
    assert(health.status === 200 && health.data.status === 'ok', 'Server health check returns 200 ok');

    // 2. Auth Tests
    console.log('\n--- 2. Auth & Roles ---');
    // Customer login
    const custLogin = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'customer@demo.com', password: 'demo' });
    assert(custLogin.status === 200 && custLogin.data.user.role === 'customer', 'Customer login returns customer role');

    // Provider login
    const provLogin = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'provider@demo.com', password: 'demo' });
    assert(provLogin.status === 200 && provLogin.data.user.role === 'provider', 'Provider login returns provider role');

    // Admin login
    const adminLogin = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@demo.com', password: 'admin' });
    assert(adminLogin.status === 200 && adminLogin.data.user.role === 'admin', 'Admin login returns admin role');

    // Invalid password test
    const badLogin = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@demo.com', password: 'wrongpassword' });
    assert(badLogin.status === 401, 'Invalid password correctly rejected with 401');

    // Quick switch
    const switchTest = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/demo-switch',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { role: 'admin' });
    assert(switchTest.status === 200 && switchTest.data.user.role === 'admin', 'Demo switch to admin functions properly');

    // 3. Customer Discovery (Categories, Services, Areas, Providers)
    console.log('\n--- 3. Discovery: Categories, Services, Areas ---');
    const categories = await request({ hostname: 'localhost', port: 3000, path: '/api/categories', method: 'GET' });
    assert(categories.status === 200 && Array.isArray(categories.data) && categories.data.length > 0, 'Categories endpoint returns list of categories');

    const locations = await request({ hostname: 'localhost', port: 3000, path: '/api/locations', method: 'GET' });
    assert(locations.status === 200 && Array.isArray(locations.data) && locations.data.length > 0, 'Locations endpoint returns Egyptian areas (Dokki, Mohandessin, etc.)');

    const services = await request({ hostname: 'localhost', port: 3000, path: '/api/services?categoryId=cat_plumbing', method: 'GET' });
    assert(services.status === 200 && Array.isArray(services.data) && services.data.length > 0, 'Services endpoint filtered by categoryId works');

    // Search providers
    console.log('\n--- 4. Search & Provider Profile ---');
    const providers = await request({ hostname: 'localhost', port: 3000, path: '/api/providers?category=cat_plumbing', method: 'GET' });
    assert(providers.status === 200 && Array.isArray(providers.data) && providers.data.length > 0, 'Providers search by category returns results');

    const firstProv = providers.data[0];
    const provDetails = await request({ hostname: 'localhost', port: 3000, path: `/api/providers/${firstProv.id}`, method: 'GET' });
    assert(provDetails.status === 200 && provDetails.data.id === firstProv.id, 'Provider profile details loaded with services & areas');

    // 5. Booking Workflow: Create -> Accept -> In-Progress -> Complete -> Commission
    console.log('\n--- 5. Booking Lifecycle ---');
    const createBooking = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/bookings',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      customerId: custLogin.data.customer?.id || 'cust_1',
      customerUserId: custLogin.data.user.id,
      providerId: firstProv.id,
      serviceId: firstProv.serviceIds[0] || 'srv_plumb_faucet',
      locationId: firstProv.areaIds[0] || 'loc_dokki',
      problemDescription: 'تسريب مياه في خلاط المطبخ والماسورة تحت الحوض',
      customerPhone: '01123456789',
      addressDetails: 'شارع مصدق - الدقي - الدور 4 شقة 12',
      preferredDate: '2026-03-10',
      preferredTime: 'مساءً (4 - 8)',
      urgency: 'urgent'
    });
    assert(createBooking.status === 201 && createBooking.data.id && createBooking.data.status === 'PENDING', 'Booking created with PENDING status');
    const newBookingId = createBooking.data.id;

    // View single booking with history
    const getBooking = await request({ hostname: 'localhost', port: 3000, path: `/api/bookings/${newBookingId}`, method: 'GET' });
    assert(getBooking.status === 200 && getBooking.data.history && getBooking.data.history.length >= 1, 'Booking history shows creation event');

    // Provider accepts booking
    const acceptBooking = await request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/bookings/${newBookingId}/status`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      status: 'ACCEPTED',
      changedByUserId: firstProv.userId,
      reason: 'تم قبول الموعد وسيتم الحضور في الوقت المحدد'
    });
    assert(acceptBooking.status === 200 && acceptBooking.data.status === 'ACCEPTED', 'Provider accepts booking');

    // Change to IN_PROGRESS
    const startBooking = await request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/bookings/${newBookingId}/status`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      status: 'IN_PROGRESS',
      changedByUserId: firstProv.userId,
      reason: 'الفني وصل وبدأ الصيانة'
    });
    assert(startBooking.status === 200 && startBooking.data.status === 'IN_PROGRESS', 'Status updated to IN_PROGRESS');

    // Complete booking with finalPrice: 400 EGP
    const completeBooking = await request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/bookings/${newBookingId}/status`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      status: 'COMPLETED',
      changedByUserId: firstProv.userId,
      finalPrice: 400,
      reason: 'تم الإصلاح بنجاح وتم تحصيل 400 ج.م'
    });
    assert(completeBooking.status === 200 && completeBooking.data.status === 'COMPLETED', 'Status updated to COMPLETED');
    assert(completeBooking.data.finalPrice === 400, 'Final agreed price recorded as 400');
    assert(completeBooking.data.commissionAmount === 40, 'Platform commission 10% calculated (40 EGP)');
    assert(completeBooking.data.providerEarnings === 360, 'Provider net earnings calculated (360 EGP)');

    // 6. Review Workflow
    console.log('\n--- 6. Review & Reply ---');
    const reviewRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/reviews',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      bookingId: newBookingId,
      customerId: custLogin.data.customer?.id || 'cust_1',
      customerUserId: custLogin.data.user.id,
      providerId: firstProv.id,
      rating: 5,
      comment: 'شغل ممتاز جداً ومحترم وسريع في الميعاد'
    });
    assert(reviewRes.status === 201 && reviewRes.data.id, 'Review created successfully for completed booking');

    // Provider replies to review
    if (reviewRes.data?.id) {
      const replyRes = await request({
        hostname: 'localhost',
        port: 3000,
        path: `/api/reviews/${reviewRes.data.id}/reply`,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      }, {
        replyText: 'شكراً لذوق حضرتك وتشرفنا بخدمتكم دائماً!',
        providerUserId: firstProv.userId
      });
      assert(replyRes.status === 200 && replyRes.data.providerReply, 'Provider replied to review successfully');
    }

    // 7. Duplicate review prevention on same booking
    const dupReviewRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/reviews',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      bookingId: newBookingId,
      customerId: custLogin.data.customer?.id || 'cust_1',
      customerUserId: custLogin.data.user.id,
      providerId: firstProv.id,
      rating: 4,
      comment: 'تقييم ثاني مكرر'
    });
    assert(dupReviewRes.status === 400, 'Duplicate review on same booking is prevented');

    // 8. Provider availability & profile update
    console.log('\n--- 8. Provider Profile & Services Update ---');
    const updateProv = await request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/providers/${firstProv.id}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-id': firstProv.userId }
    }, {
      bio: 'فني سباكة معتمد ومتخصص في كشف التسريبات وصيانة السخانات والمواسير الحرارية.',
      workingHours: { start: '08:00', end: '22:00', daysOff: ['الجمعة'] }
    });
    assert(updateProv.status === 200 && updateProv.data.workingHours.start === '08:00', 'Provider profile & working hours updated by owner');

    // Customer trying to update provider profile should be forbidden (403)
    const unauthorizedProvUpdate = await request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/providers/${firstProv.id}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-id': custLogin.data.user.id }
    }, { bio: 'Hacked bio' });
    assert(unauthorizedProvUpdate.status === 403, 'Unauthorized user correctly blocked with 403 from editing provider profile');

    // 9. Admin Management: Categories, Services, Areas, Providers, Metrics
    console.log('\n--- 9. Admin Operations & Role Enforcement ---');
    // Calling admin metrics as customer should be blocked (403)
    const custStats = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/metrics',
      method: 'GET',
      headers: { 'x-user-id': custLogin.data.user.id }
    });
    assert(custStats.status === 403, 'Customer is strictly blocked (403) from accessing admin metrics');

    // Admin metrics with admin credentials
    const stats = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/metrics',
      method: 'GET',
      headers: { 'x-user-id': 'usr_admin' }
    });
    assert(stats.status === 200 && stats.data.totalBookings > 0, 'Admin metrics endpoint returns real platform stats for admin');

    // Admin toggle provider verification
    const toggleVerif = await request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/providers/${firstProv.id}/toggle-verified`,
      method: 'PUT',
      headers: { 'x-user-id': 'usr_admin' }
    });
    assert(toggleVerif.status === 200, 'Admin can toggle provider verified badge');

    // Admin toggle provider active status
    const toggleActive = await request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/providers/${firstProv.id}/toggle-status`,
      method: 'PUT',
      headers: { 'x-user-id': 'usr_admin' }
    });
    assert(toggleActive.status === 200, 'Admin can toggle provider active status');

    // Re-activate provider
    await request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/providers/${firstProv.id}/toggle-status`,
      method: 'PUT',
      headers: { 'x-user-id': 'usr_admin' }
    });

    // Admin customer list
    const custList = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/customers',
      method: 'GET',
      headers: { 'x-user-id': 'usr_admin' }
    });
    assert(custList.status === 200 && Array.isArray(custList.data) && custList.data.length > 0, 'Admin can retrieve customers list');

    // Admin delete review
    const delReview = await request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/reviews/${reviewRes.data.id}`,
      method: 'DELETE',
      headers: { 'x-user-id': 'usr_admin' }
    });
    assert(delReview.status === 200 && delReview.data.success === true, 'Admin can delete inappropriate review');

  } catch (err) {
    console.error('Test execution error:', err);
    failures.push(err.message);
  }

  console.log('\n=== TEST RESULTS ===');
  console.log(`Passed: ${passes}`);
  console.log(`Failed: ${failures.length}`);
  if (failures.length > 0) {
    console.log('Failures list:', failures);
  }
}

runTests();
