// Comprehensive functional test for chat system
console.log('🚀 Starting comprehensive chat system test...');

// Test 1: Supabase Connection and Configuration
async function testSupabaseConnection() {
  console.log('\n📡 Testing Supabase Connection...');
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = 'https://dmsodonmkffyvbuxtxec.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');
    
    // Test basic connection
    const { data: healthCheck, error: healthError } = await supabase
      .from('app_d379dcb283_messages')
      .select('id')
      .limit(1);
    
    if (healthError) {
      console.log('❌ Connection test failed:', healthError.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    console.log('📊 Sample message ID:', healthCheck?.[0]?.id || 'No messages found');
    
    // Test realtime capabilities
    console.log('🔄 Testing realtime capabilities...');
    const channel = supabase.channel('test-functional-channel');
    console.log('✅ Realtime channel created');
    
    return { supabase, channel };
  } catch (error) {
    console.log('❌ Supabase test failed:', error.message);
    return false;
  }
}

// Test 2: Message Sending Simulation
async function testMessageSending(supabase) {
  console.log('\n📤 Testing Message Sending...');
  
  try {
    const clientId = `test-${Date.now()}`;
    const conversationId = 'support-1';
    const messageContent = `Test message from functional test - ${new Date().toISOString()}`;
    
    console.log(`🔍 Sending optimistic message with client_id: ${clientId}`);
    
    // Simulate optimistic message creation
    const optimisticMessage = {
      id: `temp-${clientId}`,
      client_id: clientId,
      conversation_id: conversationId,
      content: messageContent,
      sender_id: 'test-client',
      sender_name: 'Test Client',
      sender_type: 'client',
      status: 'sending',
      attachments: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('📝 Optimistic message:', optimisticMessage);
    
    // Send to Supabase
    const { data, error } = await supabase
      .from('app_d379dcb283_messages')
      .insert({
        client_id: clientId,
        conversation_id: conversationId,
        content: messageContent,
        sender_id: 'test-client',
        sender_name: 'Test Client',
        sender_type: 'client',
        status: 'sent',
        attachments: []
      })
      .select()
      .single();
    
    if (error) {
      console.log('❌ Message insertion failed:', error.message);
      return false;
    }
    
    console.log('✅ Message sent successfully to database');
    console.log('📊 Inserted message:', {
      id: data.id,
      client_id: data.client_id,
      status: data.status,
      created_at: data.created_at
    });
    
    return { clientId, messageId: data.id, sentMessage: data };
  } catch (error) {
    console.log('❌ Message sending test failed:', error.message);
    return false;
  }
}

// Test 3: Realtime Subscription
async function testRealtimeSubscription(supabase, testClientId) {
  console.log('\n🔄 Testing Realtime Subscription...');
  
  return new Promise((resolve) => {
    let subscriptionReceived = false;
    let timeoutId;
    
    const channel = supabase
      .channel('test-messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'app_d379dcb283_messages'
        },
        (payload) => {
          console.log('🔥 Realtime message received:', payload.new);
          
          if (payload.new.client_id === testClientId) {
            console.log('✅ Correct message received via realtime');
            subscriptionReceived = true;
            clearTimeout(timeoutId);
            supabase.removeChannel(channel);
            resolve(true);
          }
        }
      )
      .subscribe((status) => {
        console.log(`📡 Subscription status: ${status}`);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to realtime updates');
          
          // Set timeout for receiving messages
          timeoutId = setTimeout(() => {
            if (!subscriptionReceived) {
              console.log('⚠️ No realtime message received within timeout');
              supabase.removeChannel(channel);
              resolve(false);
            }
          }, 5000);
        } else if (status === 'CLOSED') {
          console.log('🔌 Subscription closed');
        } else if (status === 'CHANNEL_ERROR') {
          console.log('❌ Subscription error');
          clearTimeout(timeoutId);
          resolve(false);
        }
      });
  });
}

// Test 4: Status Update Flow
async function testStatusUpdateFlow(supabase, messageId) {
  console.log('\n🔄 Testing Status Update Flow...');
  
  try {
    // Simulate status updates
    const statuses = ['sent', 'delivered', 'read'];
    
    for (const status of statuses) {
      console.log(`📝 Updating message status to: ${status}`);
      
      const { error } = await supabase
        .from('app_d379dcb283_messages')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', messageId);
      
      if (error) {
        console.log(`❌ Failed to update status to ${status}:`, error.message);
        return false;
      }
      
      console.log(`✅ Status updated to: ${status}`);
      
      // Wait a bit between updates
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return true;
  } catch (error) {
    console.log('❌ Status update test failed:', error.message);
    return false;
  }
}

// Test 5: Clean up test data
async function cleanupTestData(supabase, clientId) {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    const { error } = await supabase
      .from('app_d379dcb283_messages')
      .delete()
      .eq('client_id', clientId);
    
    if (error) {
      console.log('⚠️ Cleanup warning:', error.message);
    } else {
      console.log('✅ Test data cleaned up successfully');
    }
  } catch (error) {
    console.log('⚠️ Cleanup error:', error.message);
  }
}

// Main test execution
async function runComprehensiveTest() {
  console.log('🎯 Running Comprehensive Chat System Test');
  console.log('=' .repeat(60));
  
  const results = {
    supabaseConnection: false,
    messageSending: false,
    realtimeSubscription: false,
    statusUpdates: false,
    issues: [],
    recommendations: []
  };
  
  try {
    // Test 1: Supabase Connection
    const connectionResult = await testSupabaseConnection();
    if (connectionResult) {
      results.supabaseConnection = true;
      const { supabase, channel } = connectionResult;
      
      // Test 2: Message Sending
      const sendingResult = await testMessageSending(supabase);
      if (sendingResult) {
        results.messageSending = true;
        const { clientId, messageId } = sendingResult;
        
        // Test 3: Realtime Subscription (run in parallel with a new message)
        const realtimePromise = testRealtimeSubscription(supabase, `realtime-${Date.now()}`);
        
        // Send a message for realtime testing
        setTimeout(async () => {
          const realtimeClientId = `realtime-${Date.now()}`;
          await supabase
            .from('app_d379dcb283_messages')
            .insert({
              client_id: realtimeClientId,
              conversation_id: 'support-1',
              content: 'Realtime test message',
              sender_id: 'test-client',
              sender_name: 'Test Client',
              sender_type: 'client',
              status: 'sent',
              attachments: []
            });
        }, 1000);
        
        const realtimeResult = await realtimePromise;
        results.realtimeSubscription = realtimeResult;
        
        // Test 4: Status Updates
        const statusResult = await testStatusUpdateFlow(supabase, messageId);
        results.statusUpdates = statusResult;
        
        // Cleanup
        await cleanupTestData(supabase, clientId);
      }
    }
    
    // Generate report
    console.log('\n📊 TEST RESULTS');
    console.log('=' .repeat(60));
    console.log(`Supabase Connection: ${results.supabaseConnection ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Message Sending: ${results.messageSending ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Realtime Subscription: ${results.realtimeSubscription ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Status Updates: ${results.statusUpdates ? '✅ PASS' : '❌ FAIL'}`);
    
    // Identify issues
    if (!results.supabaseConnection) {
      results.issues.push('Supabase connection failure - Check credentials and network');
      results.recommendations.push('Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    }
    
    if (!results.messageSending) {
      results.issues.push('Message insertion failure - Database or permissions issue');
      results.recommendations.push('Check RLS policies and table permissions');
    }
    
    if (!results.realtimeSubscription) {
      results.issues.push('Realtime subscription failure - This could cause clock icon persistence');
      results.recommendations.push('Check Supabase Realtime settings and subscription logic');
    }
    
    if (!results.statusUpdates) {
      results.issues.push('Status update failure - Messages may remain in sending state');
      results.recommendations.push('Verify update permissions and status field constraints');
    }
    
    console.log('\n🐛 IDENTIFIED ISSUES:');
    results.issues.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));
    
    console.log('\n💡 RECOMMENDATIONS:');
    results.recommendations.forEach((rec, i) => console.log(`${i + 1}. ${rec}`));
    
    console.log('\n🎯 CLOCK ICON ISSUE DIAGNOSIS:');
    if (!results.realtimeSubscription) {
      console.log('❌ LIKELY ROOT CAUSE: Realtime subscription not working properly');
      console.log('   The optimistic message status stays as "sending" because realtime');
      console.log('   updates are not received to change it to "sent"');
    } else if (!results.statusUpdates) {
      console.log('❌ LIKELY ROOT CAUSE: Status updates not working');
      console.log('   Messages are sent but status is not being updated correctly');
    } else {
      console.log('✅ Backend functionality appears to be working');
      console.log('   Issue may be in frontend state management or UI rendering');
    }
    
    return results;
    
  } catch (error) {
    console.log('💥 Test execution failed:', error.message);
    return results;
  }
}

// Export for browser console usage
window.runChatTest = runComprehensiveTest;

// Auto-run if not in browser
if (typeof window === 'undefined') {
  runComprehensiveTest();
}

console.log('✅ Test script loaded. Run window.runChatTest() in browser console to execute tests.');