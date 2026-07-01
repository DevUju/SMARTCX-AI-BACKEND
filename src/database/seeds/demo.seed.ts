import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { Business } from '../../common/entities/business.entity';
import { User } from '../../common/entities/user.entity';
import { Customer } from '../../common/entities/customer.entity';
import { Channel } from '../../common/entities/channel.entity';
import { Issue } from '../../common/entities/issue.entity';
import { Ticket } from '../../common/entities/ticket.entity';
import { Message } from '../../common/entities/message.entity';
import { ChannelType } from '../../common/enums/channel-type.enum';
import { Priority } from '../../common/enums/priority.enum';
import { IssueStatus } from '../../common/enums/issue-status.enum';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { SentimentLabel } from '../../common/enums/sentiment-label.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import { CustomerStatus } from '../../common/enums/customer-status.enum';
import { MessageSenderType } from '../../common/enums/message-sender-type.enum';

export async function seedDatabase(dataSource: DataSource): Promise<void> {
  const businessRepo = dataSource.getRepository(Business);
  const userRepo = dataSource.getRepository(User);
  const customerRepo = dataSource.getRepository(Customer);
  const channelRepo = dataSource.getRepository(Channel);
  const issueRepo = dataSource.getRepository(Issue);
  const ticketRepo = dataSource.getRepository(Ticket);
  const messageRepo = dataSource.getRepository(Message);

  console.log('🌱 Starting database seeding...');

  // Check if demo business already exists by looking for the business owner user
  const existingUser = await userRepo.findOne({
    where: { email: 'aisha@smartcxdemo.com' },
  });

  if (existingUser) {
    await channelRepo.update(
      { businessId: existingUser.businessId },
      { isConnected: false, connectedAt: null, credentials: {} },
    );

    console.log('✅ Demo data already exists! Skipping seeding.');
    console.log('✓ Reset existing demo channels to disconnected state for fresh connection tests.');
    console.log('\n📝 Demo Login Credentials:');
    console.log('   Email: aisha@smartcxdemo.com');
    console.log('   Password: Demo@1234');
    return;
  }

  // Create demo business
  const passwordHash = await bcrypt.hash('Demo@1234', 12);
  const businessId = uuidv4();

  const business = businessRepo.create({
    id: businessId,
    businessName: 'SmartCX Demo Retail',
    ownerName: 'Aisha Bello',
    email: 'aisha@smartcxdemo.com',
    phone: '09012345678',
    category: 'Retail',
    passwordHash,
    logoUrl: null,
    isActive: true,
  });
  await businessRepo.save(business);
  console.log('✓ Created Business:', business.businessName);

  // Create owner user (Aisha)
  const ownerUser = userRepo.create({
    id: uuidv4(),
    businessId,
    firstName: 'Aisha',
    lastName: 'Bello',
    email: 'aisha@smartcxdemo.com',
    passwordHash,
    role: UserRole.SUPER_ADMIN,
    isOnline: true,
    lastSeenAt: new Date(),
  });
  await userRepo.save(ownerUser);
  console.log('✓ Created Owner: Aisha Bello (aisha@smartcxdemo.com)');

  // Create demo agent users
  const agentNames = [
    { firstName: 'Ikenna', lastName: 'Obi', email: 'ikenna@smartcxdemo.com', role: UserRole.ADMIN },
    { firstName: 'Tomiwa', lastName: 'Ade', email: 'tomiwa@smartcxdemo.com', role: UserRole.AGENT },
    { firstName: 'Chioma', lastName: 'Eze', email: 'chioma@smartcxdemo.com', role: UserRole.AGENT },
  ];

  const users: User[] = [ownerUser];
  for (const agent of agentNames) {
    const user = userRepo.create({
      id: uuidv4(),
      businessId,
      firstName: agent.firstName,
      lastName: agent.lastName,
      email: agent.email,
      passwordHash,
      role: agent.role,
      isOnline: true,
      lastSeenAt: new Date(),
    });
    await userRepo.save(user);
    users.push(user);
  }
  console.log(`✓ Created ${users.length - 1} demo agents`);

  // Create demo customers
  const customerData = [
    { name: 'Chidi Okafor', phone: '08112345671', email: 'chidi@yopmail.com', channel: ChannelType.WHATSAPP, status: CustomerStatus.NEW },
    { name: 'Ngozi Ejiofor', phone: '08112345672', email: 'ngozi@yopmail.com', channel: ChannelType.INSTAGRAM, status: CustomerStatus.RETURNING },
    { name: 'Kayode Adeyemi', phone: '08112345673', email: 'kayode@yopmail.com', channel: ChannelType.EMAIL, status: CustomerStatus.VIP },
    { name: 'Amara Nwankwo', phone: '08112345674', email: 'amara@yopmail.com', channel: ChannelType.WHATSAPP, status: CustomerStatus.RETURNING },
    { name: 'Taiwo Oluwaseun', phone: '08112345675', email: 'taiwo@yopmail.com', channel: ChannelType.INSTAGRAM, status: CustomerStatus.NEW },
    { name: 'Blessing Obi', phone: '08112345676', email: 'blessing@yopmail.com', channel: ChannelType.EMAIL, status: CustomerStatus.VIP },
    { name: 'Emeka Ihuoma', phone: '08112345677', email: 'emeka@yopmail.com', channel: ChannelType.WHATSAPP, status: CustomerStatus.RETURNING },
  ];

  const customers: Customer[] = [];
  for (const data of customerData) {
    const customer = customerRepo.create({
      id: uuidv4(),
      businessId,
      name: data.name,
      phone: data.phone,
      email: data.email,
      channel: data.channel,
      totalSpent: Math.floor(Math.random() * 150000) + 10000,
      location: 'Lagos',
      status: data.status,
    });
    await customerRepo.save(customer);
    customers.push(customer);
  }
  console.log(`✓ Created ${customers.length} demo customers`);

  // Create demo channels
  const channelData = [
    { type: ChannelType.WHATSAPP, isConnected: false },
    { type: ChannelType.INSTAGRAM, isConnected: false },
    { type: ChannelType.EMAIL, isConnected: false },
  ];

  for (const data of channelData) {
    const channel = channelRepo.create({
      id: uuidv4(),
      businessId,
      type: data.type,
      credentials: {},
      isConnected: data.isConnected,
      connectedAt: null,
    });
    await channelRepo.save(channel);
  }
  console.log('✓ Created 3 demo channels (WhatsApp, Instagram, Email) in disconnected state');

  // Create demo issues
  const issueMessages = [
    {
      customer: customers[0],
      channel: ChannelType.WHATSAPP,
      message: "I ordered a phone last week but it hasn't arrived yet. Where's my delivery?",
      sentiment: SentimentLabel.FRUSTRATED,
      sentimentScore: -0.6,
      category: 'Delivery',
      priority: Priority.HIGH,
      status: IssueStatus.PENDING,
    },
    {
      customer: customers[1],
      channel: ChannelType.INSTAGRAM,
      message: 'The dress I bought has a defect. Can I get a replacement?',
      sentiment: SentimentLabel.NEUTRAL,
      sentimentScore: -0.2,
      category: 'Product',
      priority: Priority.MEDIUM,
      status: IssueStatus.PENDING,
    },
    {
      customer: customers[2],
      channel: ChannelType.EMAIL,
      message: 'I want to return my purchase from last month.',
      sentiment: SentimentLabel.NEUTRAL,
      sentimentScore: 0,
      category: 'Refund',
      priority: Priority.MEDIUM,
      status: IssueStatus.NEW,
    },
    {
      customer: customers[3],
      channel: ChannelType.WHATSAPP,
      message: 'Excellent service! Thank you so much for the quick response.',
      sentiment: SentimentLabel.POSITIVE,
      sentimentScore: 0.8,
      category: 'General',
      priority: Priority.LOW,
      status: IssueStatus.CONVERTED,
    },
    {
      customer: customers[4],
      channel: ChannelType.INSTAGRAM,
      message: 'I have been trying to contact support for 3 days now with no response!!!',
      sentiment: SentimentLabel.ANGRY,
      sentimentScore: -0.9,
      category: 'Support',
      priority: Priority.URGENT,
      status: IssueStatus.NEW,
    },
  ];

  const issues: Issue[] = [];
  for (const data of issueMessages) {
    const issue = issueRepo.create({
      id: uuidv4(),
      businessId,
      customerId: data.customer.id,
      channelType: data.channel,
      messagePreview: data.message.substring(0, 100),
      rawMessages: [{ text: data.message, timestamp: new Date() }],
      sentimentScore: data.sentimentScore,
      sentimentLabel: data.sentiment,
      category: data.category,
      priority: data.priority,
      status: data.status,
      aiAnalysisSummary: `Issue detected: ${data.category}. Sentiment is ${data.sentiment}. Customer needs immediate attention.`,
    });
    await issueRepo.save(issue);
    issues.push(issue);
  }
  console.log(`✓ Created ${issues.length} demo issues`);

  // Create demo tickets from converted issues with spread timestamps
  const tickets: Ticket[] = [];
  const now = new Date();
  
  // Ticket 1: Open, assigned to Ikenna (created 20 hours ago)
  const ticket1CreatedAt = new Date(now.getTime() - 20 * 60 * 60 * 1000);
  const ticket1 = ticketRepo.create({
    id: uuidv4(),
    businessId,
    issueId: issues[0].id,
    customerId: issues[0].customerId,
    ticketNumber: `TKT-${Date.now()}-001`,
    title: 'Urgent: Delivery delay - Customer upset',
    category: 'Delivery',
    priority: Priority.URGENT,
    status: TicketStatus.OPEN,
    assignedAgentId: users[1].id, // Ikenna (admin)
    aiDraftSummary: 'Customer order delayed by 5 days. Tracking shows package stuck at distribution center. Recommend shipping expedite or refund.',
    aiInsightSummary: 'High urgency: Customer sentiment shifted from neutral to frustrated. Previous positive purchase history at risk.',
    internalNotes: ['Check Lagos warehouse status', 'Prepare expedited shipping option'],
    createdAt: ticket1CreatedAt,
    resolvedAt: null,
    resolutionSummary: null,
  });
  await ticketRepo.save(ticket1);
  tickets.push(ticket1);

  // Add messages for ticket 1
  const ticket1Messages = [
    {
      ticketId: ticket1.id,
      senderType: MessageSenderType.CUSTOMER,
      content: 'My order is supposed to arrive today but I still don\'t have it!',
      senderId: issues[0].customerId,
    },
    {
      ticketId: ticket1.id,
      senderType: MessageSenderType.AGENT,
      content: 'I sincerely apologize for the delay. Let me check your shipment status immediately.',
      senderId: users[1].id,
    },
    {
      ticketId: ticket1.id,
      senderType: MessageSenderType.AGENT,
      content: 'Your package is currently in our Lagos facility. We\'re expediting it for delivery tomorrow morning.',
      senderId: users[1].id,
    },
  ];

  for (const msgData of ticket1Messages) {
    const message = messageRepo.create({
      id: uuidv4(),
      ticketId: msgData.ticketId,
      senderId: msgData.senderId,
      senderType: msgData.senderType,
      content: msgData.content,
      attachmentUrl: null,
      isInternalNote: false,
    });
    await messageRepo.save(message);
  }

  // Ticket 2: Resolved, assigned to Tomiwa (created 16 hours ago, resolved 12 hours ago = 4 hour response)
  const ticket2CreatedAt = new Date(now.getTime() - 16 * 60 * 60 * 1000);
  const ticket2ResolvedAt = new Date(now.getTime() - 12 * 60 * 60 * 1000);
  const ticket2 = ticketRepo.create({
    id: uuidv4(),
    businessId,
    issueId: issues[1].id,
    customerId: issues[1].customerId,
    ticketNumber: `TKT-${Date.now()}-002`,
    title: 'Product defect - Dress replacement',
    category: 'Product',
    priority: Priority.MEDIUM,
    status: TicketStatus.RESOLVED,
    assignedAgentId: users[2].id, // Tomiwa (agent)
    aiDraftSummary: 'Customer received defective dress. Quality control issue identified. Replacement in stock.',
    aiInsightSummary: 'Positive resolution: Replacement shipped same day. Customer satisfaction likely high.',
    internalNotes: ['Flag supplier for quality check', 'Send apology coupon'],
    createdAt: ticket2CreatedAt,
    resolvedAt: ticket2ResolvedAt,
    resolutionSummary: 'Replacement dress sent with 2-day delivery. Customer apologized to via message.',
    sentimentShiftStart: 'frustrated',
    sentimentShiftEnd: 'satisfied',
  });
  await ticketRepo.save(ticket2);
  tickets.push(ticket2);

  // Add messages for ticket 2
  const ticket2Messages = [
    {
      ticketId: ticket2.id,
      senderType: MessageSenderType.CUSTOMER,
      content: 'This dress has a seam defect. I need a replacement immediately.',
      senderId: issues[1].customerId,
    },
    {
      ticketId: ticket2.id,
      senderType: MessageSenderType.AGENT,
      content: 'We apologize for this manufacturing issue. I\'m arranging a replacement right away.',
      senderId: users[2].id,
    },
    {
      ticketId: ticket2.id,
      senderType: MessageSenderType.AGENT,
      content: 'Your replacement has been shipped. Tracking: 12345XY. Should arrive by Friday.',
      senderId: users[2].id,
    },
    {
      ticketId: ticket2.id,
      senderType: MessageSenderType.CUSTOMER,
      content: 'Thank you! This is great customer service.',
      senderId: issues[1].customerId,
    },
  ];

  for (const msgData of ticket2Messages) {
    const message = messageRepo.create({
      id: uuidv4(),
      ticketId: msgData.ticketId,
      senderId: msgData.senderId,
      senderType: msgData.senderType,
      content: msgData.content,
      attachmentUrl: null,
      isInternalNote: false,
    });
    await messageRepo.save(message);
  }

  // Ticket 3: Pending, assigned to Chioma (created 8 hours ago)
  const ticket3CreatedAt = new Date(now.getTime() - 8 * 60 * 60 * 1000);
  const ticket3 = ticketRepo.create({
    id: uuidv4(),
    businessId,
    issueId: issues[2].id,
    customerId: issues[2].customerId,
    ticketNumber: `TKT-${Date.now()}-003`,
    title: 'Return request - Refund processing',
    category: 'Refund',
    priority: Priority.MEDIUM,
    status: TicketStatus.PENDING,
    assignedAgentId: users[3].id, // Chioma (agent)
    aiDraftSummary: 'Customer requesting return of item purchased last month. Within 30-day window.',
    aiInsightSummary: 'Standard return process. Approx. 5-7 days for processing and refund.',
    internalNotes: ['Request item photos', 'Check warranty status'],
    createdAt: ticket3CreatedAt,
    resolvedAt: null,
    resolutionSummary: null,
  });
  await ticketRepo.save(ticket3);
  tickets.push(ticket3);

  // Add messages for ticket 3
  const ticket3Messages = [
    {
      ticketId: ticket3.id,
      senderType: MessageSenderType.CUSTOMER,
      content: 'I purchased this last month but it\'s not what I expected. Can I return it?',
      senderId: issues[2].customerId,
    },
    {
      ticketId: ticket3.id,
      senderType: MessageSenderType.AGENT,
      content: 'Of course! You\'re within our 30-day return window. Could you send photos of the item?',
      senderId: users[3].id,
    },
  ];

  for (const msgData of ticket3Messages) {
    const message = messageRepo.create({
      id: uuidv4(),
      ticketId: msgData.ticketId,
      senderId: msgData.senderId,
      senderType: msgData.senderType,
      content: msgData.content,
      attachmentUrl: null,
      isInternalNote: false,
    });
    await messageRepo.save(message);
  }

  // Ticket 4: Resolved, assigned to Ikenna (created 30 hours ago, resolved 24 hours ago = 6 hour response)
  const ticket4CreatedAt = new Date(now.getTime() - 30 * 60 * 60 * 1000);
  const ticket4ResolvedTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const ticket4 = ticketRepo.create({
    id: uuidv4(),
    businessId,
    issueId: issues[3].id,
    customerId: issues[3].customerId,
    ticketNumber: `TKT-${Date.now()}-004`,
    title: 'Positive feedback - Quick resolution',
    category: 'General',
    priority: Priority.LOW,
    status: TicketStatus.RESOLVED,
    assignedAgentId: users[1].id, // Ikenna
    aiDraftSummary: 'Customer expressing satisfaction with order and quick response time.',
    aiInsightSummary: 'VIP interaction: Positive sentiment. Opportunity for loyalty program enrollment.',
    internalNotes: ['Add to VIP list', 'Send exclusive offers'],
    createdAt: ticket4CreatedAt,
    resolvedAt: ticket4ResolvedTime,
    resolutionSummary: 'Customer appreciated speedy service. Converted to VIP member.',
    sentimentShiftStart: 'positive',
    sentimentShiftEnd: 'very satisfied',
  });
  await ticketRepo.save(ticket4);
  tickets.push(ticket4);

  // Add message for ticket 4
  const ticket4Messages = [
    {
      ticketId: ticket4.id,
      senderType: MessageSenderType.CUSTOMER,
      content: 'Excellent service! Thank you so much for the quick response.',
      senderId: issues[3].customerId,
    },
    {
      ticketId: ticket4.id,
      senderType: MessageSenderType.AGENT,
      content: 'Thank you for choosing us! We\'re honored by your feedback.',
      senderId: users[1].id,
    },
  ];

  for (const msgData of ticket4Messages) {
    const message = messageRepo.create({
      id: uuidv4(),
      ticketId: msgData.ticketId,
      senderId: msgData.senderId,
      senderType: msgData.senderType,
      content: msgData.content,
      attachmentUrl: null,
      isInternalNote: false,
    });
    await messageRepo.save(message);
  }

  console.log(`✓ Created ${tickets.length} demo tickets with messages and assignments`);
  console.log(`✓ Assigned tickets to agents (Ikenna, Tomiwa, Chioma)`);

  console.log('\n✅ Database seeding completed successfully!');
  console.log('\n📝 Demo Login Credentials:');
  console.log('   Email: aisha@smartcxdemo.com');
  console.log('   Password: Demo@1234');
  console.log('\n📊 Demo Data Summary:');
  console.log(`   Business: 1 (SmartCX Demo Retail)`);
  console.log(`   Users: ${users.length}`);
  console.log(`   Customers: ${customers.length}`);
  console.log(`   Channels: 3`);
  console.log(`   Issues: ${issues.length}`);
  console.log(`   Tickets: ${tickets.length}`);
  console.log(`   Messages: ${ticket1Messages.length + ticket2Messages.length + ticket3Messages.length + ticket4Messages.length}`);
  console.log('\n🎯 Ticket Status Breakdown:');
  console.log('   • 1 OPEN (Urgent - Delivery)');
  console.log('   • 1 PENDING (Medium - Refund)');
  console.log('   • 2 RESOLVED (Low & Medium priorities)');
  console.log('\n👥 Agent Assignments:');
  console.log('   • Ikenna Obi (Admin): 2 tickets');
  console.log('   • Tomiwa Ade (Agent): 1 ticket');
  console.log('   • Chioma Eze (Agent): 1 ticket');
}
