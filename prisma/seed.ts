import { PrismaClient, Role, ContactStatus, DealStage, ActivityType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.activity.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  const [alice, bob, carol] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alice Johnson',
        email: 'alice@crm.com',
        password: hashedPassword,
        role: Role.ADMIN,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Bob Smith',
        email: 'bob@crm.com',
        password: hashedPassword,
        role: Role.MANAGER,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Carol Williams',
        email: 'carol@crm.com',
        password: hashedPassword,
        role: Role.MEMBER,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol',
      },
    }),
  ]);

  const contactsData = [
    { name: 'Acme Corp', email: 'contact@acme.com', phone: '+1-555-0101', company: 'Acme Corp', status: ContactStatus.CUSTOMER, tags: ['enterprise', 'tech'], assignedToId: alice.id },
    { name: 'Globex Ltd', email: 'info@globex.com', phone: '+1-555-0102', company: 'Globex Ltd', status: ContactStatus.PROSPECT, tags: ['mid-market'], assignedToId: bob.id },
    { name: 'Initech Systems', email: 'sales@initech.com', phone: '+1-555-0103', company: 'Initech Systems', status: ContactStatus.LEAD, tags: ['startup', 'saas'], assignedToId: carol.id },
    { name: 'Umbrella Inc', email: 'bd@umbrella.com', phone: '+1-555-0104', company: 'Umbrella Inc', status: ContactStatus.CUSTOMER, tags: ['enterprise'], assignedToId: alice.id },
    { name: 'Hooli Technologies', email: 'partnership@hooli.com', phone: '+1-555-0105', company: 'Hooli Technologies', status: ContactStatus.PROSPECT, tags: ['big-tech', 'partnership'], assignedToId: bob.id },
    { name: 'Pied Piper', email: 'hello@piedpiper.com', phone: '+1-555-0106', company: 'Pied Piper', status: ContactStatus.LEAD, tags: ['startup'], assignedToId: carol.id },
    { name: 'Dunder Mifflin', email: 'sales@dundermifflin.com', phone: '+1-555-0107', company: 'Dunder Mifflin', status: ContactStatus.CUSTOMER, tags: ['smb', 'retail'], assignedToId: alice.id },
    { name: 'Vandelay Industries', email: 'contact@vandelay.com', phone: '+1-555-0108', company: 'Vandelay Industries', status: ContactStatus.CHURNED, tags: ['wholesale'], assignedToId: bob.id },
    { name: 'Sterling Cooper', email: 'new@sterlingcooper.com', phone: '+1-555-0109', company: 'Sterling Cooper', status: ContactStatus.PROSPECT, tags: ['agency', 'creative'], assignedToId: carol.id },
    { name: 'Bluth Company', email: 'lucille@bluth.com', phone: '+1-555-0110', company: 'Bluth Company', status: ContactStatus.LEAD, tags: ['real-estate'], assignedToId: alice.id },
    { name: 'Veridian Dynamics', email: 'info@veridian.com', phone: '+1-555-0111', company: 'Veridian Dynamics', status: ContactStatus.CUSTOMER, tags: ['biotech', 'enterprise'], assignedToId: bob.id },
    { name: 'Massive Dynamics', email: 'hello@massivedyn.com', phone: '+1-555-0112', company: 'Massive Dynamics', status: ContactStatus.PROSPECT, tags: ['r&d', 'tech'], assignedToId: carol.id },
    { name: 'Wernham Hogg', email: 'david@wernhamhogg.co.uk', phone: '+44-555-0113', company: 'Wernham Hogg', status: ContactStatus.LEAD, tags: ['smb', 'paper'], assignedToId: alice.id },
    { name: 'Prestige Worldwide', email: 'boats@prestige.com', phone: '+1-555-0114', company: 'Prestige Worldwide', status: ContactStatus.CHURNED, tags: ['boats'], assignedToId: bob.id },
    { name: 'Cyberdyne Systems', email: 'skynet@cyberdyne.com', phone: '+1-555-0115', company: 'Cyberdyne Systems', status: ContactStatus.PROSPECT, tags: ['ai', 'defense'], assignedToId: carol.id },
    { name: 'Soylent Corp', email: 'green@soylent.com', phone: '+1-555-0116', company: 'Soylent Corp', status: ContactStatus.LEAD, tags: ['food-tech'], assignedToId: alice.id },
    { name: 'Monsters Inc', email: 'scream@monsters.com', phone: '+1-555-0117', company: 'Monsters Inc', status: ContactStatus.CUSTOMER, tags: ['energy', 'enterprise'], assignedToId: bob.id },
    { name: 'Nakatomi Corp', email: 'corp@nakatomi.jp', phone: '+81-555-0118', company: 'Nakatomi Corp', status: ContactStatus.PROSPECT, tags: ['international'], assignedToId: carol.id },
    { name: 'Rekall Inc', email: 'mars@rekall.com', phone: '+1-555-0119', company: 'Rekall Inc', status: ContactStatus.LEAD, tags: ['travel', 'vr'], assignedToId: alice.id },
    { name: 'Weyland Corp', email: 'space@weyland.com', phone: '+1-555-0120', company: 'Weyland Corp', status: ContactStatus.PROSPECT, tags: ['aerospace', 'enterprise'], assignedToId: bob.id },
  ];

  const contacts = await Promise.all(contactsData.map(c => prisma.contact.create({ data: c })));

  const now = new Date();
  const month = (offset: number) => new Date(now.getFullYear(), now.getMonth() - offset, 15);

  const dealsData = [
    { title: 'Acme Enterprise License', value: 120000, stage: DealStage.CLOSED_WON, probability: 100, contactId: contacts[0].id, assignedToId: alice.id, expectedClose: month(2) },
    { title: 'Globex Platform Upgrade', value: 45000, stage: DealStage.NEGOTIATION, probability: 75, contactId: contacts[1].id, assignedToId: bob.id, expectedClose: month(-1) },
    { title: 'Initech Starter Pack', value: 8500, stage: DealStage.PROPOSAL, probability: 50, contactId: contacts[2].id, assignedToId: carol.id, expectedClose: month(-1) },
    { title: 'Umbrella Corp Suite', value: 250000, stage: DealStage.CLOSED_WON, probability: 100, contactId: contacts[3].id, assignedToId: alice.id, expectedClose: month(3) },
    { title: 'Hooli API Integration', value: 75000, stage: DealStage.QUALIFIED, probability: 60, contactId: contacts[4].id, assignedToId: bob.id, expectedClose: month(-2) },
    { title: 'Pied Piper Pilot', value: 5000, stage: DealStage.LEAD, probability: 20, contactId: contacts[5].id, assignedToId: carol.id, expectedClose: month(-2) },
    { title: 'Dunder Mifflin Annual', value: 18000, stage: DealStage.CLOSED_WON, probability: 100, contactId: contacts[6].id, assignedToId: alice.id, expectedClose: month(1) },
    { title: 'Sterling Cooper Rebrand', value: 32000, stage: DealStage.PROPOSAL, probability: 45, contactId: contacts[8].id, assignedToId: carol.id, expectedClose: month(-1) },
    { title: 'Bluth Residential CRM', value: 15000, stage: DealStage.LEAD, probability: 15, contactId: contacts[9].id, assignedToId: alice.id, expectedClose: month(-3) },
    { title: 'Veridian Research Suite', value: 95000, stage: DealStage.NEGOTIATION, probability: 80, contactId: contacts[10].id, assignedToId: bob.id, expectedClose: month(-1) },
    { title: 'Massive Dynamics Data', value: 60000, stage: DealStage.QUALIFIED, probability: 55, contactId: contacts[11].id, assignedToId: carol.id, expectedClose: month(-2) },
    { title: 'Wernham Hogg Basic', value: 3500, stage: DealStage.CLOSED_LOST, probability: 0, contactId: contacts[12].id, assignedToId: alice.id, expectedClose: month(2) },
    { title: 'Cyberdyne AI Platform', value: 180000, stage: DealStage.PROPOSAL, probability: 40, contactId: contacts[14].id, assignedToId: bob.id, expectedClose: month(-2) },
    { title: 'Monsters Inc Energy', value: 55000, stage: DealStage.CLOSED_WON, probability: 100, contactId: contacts[16].id, assignedToId: carol.id, expectedClose: month(1) },
    { title: 'Weyland Space CRM', value: 220000, stage: DealStage.NEGOTIATION, probability: 70, contactId: contacts[19].id, assignedToId: alice.id, expectedClose: month(-1) },
  ];

  const deals = await Promise.all(dealsData.map(d => prisma.deal.create({ data: d })));

  const activitiesData = [
    { type: ActivityType.CALL, description: 'Initial discovery call with Acme Corp CTO', contactId: contacts[0].id, dealId: deals[0].id, userId: alice.id },
    { type: ActivityType.EMAIL, description: 'Sent enterprise pricing proposal to Acme', contactId: contacts[0].id, dealId: deals[0].id, userId: alice.id },
    { type: ActivityType.MEETING, description: 'Contract signing meeting with Acme legal team', contactId: contacts[0].id, dealId: deals[0].id, userId: alice.id },
    { type: ActivityType.CALL, description: 'Follow-up call with Globex IT manager', contactId: contacts[1].id, dealId: deals[1].id, userId: bob.id },
    { type: ActivityType.EMAIL, description: 'Technical specs and timeline sent to Globex', contactId: contacts[1].id, dealId: deals[1].id, userId: bob.id },
    { type: ActivityType.MEETING, description: 'Demo of new platform features for Globex', contactId: contacts[1].id, dealId: deals[1].id, userId: bob.id },
    { type: ActivityType.CALL, description: 'Intro call with Initech founder', contactId: contacts[2].id, dealId: deals[2].id, userId: carol.id },
    { type: ActivityType.NOTE, description: 'Initech interested in quarterly billing option', contactId: contacts[2].id, dealId: deals[2].id, userId: carol.id },
    { type: ActivityType.MEETING, description: 'Quarterly review with Umbrella Corp team', contactId: contacts[3].id, dealId: deals[3].id, userId: alice.id },
    { type: ActivityType.CALL, description: 'Cold call to Hooli BD team — positive response', contactId: contacts[4].id, dealId: deals[4].id, userId: bob.id },
    { type: ActivityType.EMAIL, description: 'Sent integration docs to Hooli engineering', contactId: contacts[4].id, dealId: deals[4].id, userId: bob.id },
    { type: ActivityType.NOTE, description: 'Pied Piper budget is limited, explore SMB plan', contactId: contacts[5].id, dealId: deals[5].id, userId: carol.id },
    { type: ActivityType.CALL, description: 'Renewal call with Dunder Mifflin office manager', contactId: contacts[6].id, dealId: deals[6].id, userId: alice.id },
    { type: ActivityType.MEETING, description: 'Sterling Cooper creative brief session', contactId: contacts[8].id, dealId: deals[7].id, userId: carol.id },
    { type: ActivityType.EMAIL, description: 'Proposal submitted to Veridian procurement', contactId: contacts[10].id, dealId: deals[9].id, userId: bob.id },
    { type: ActivityType.CALL, description: 'Negotiation call with Veridian VP', contactId: contacts[10].id, dealId: deals[9].id, userId: bob.id },
    { type: ActivityType.MEETING, description: 'Technical workshop with Massive Dynamics', contactId: contacts[11].id, dealId: deals[10].id, userId: carol.id },
    { type: ActivityType.NOTE, description: 'Wernham Hogg declined — budget constraints', contactId: contacts[12].id, dealId: deals[11].id, userId: alice.id },
    { type: ActivityType.MEETING, description: 'AI demo for Cyberdyne R&D team', contactId: contacts[14].id, dealId: deals[12].id, userId: bob.id },
    { type: ActivityType.CALL, description: 'Weyland Corp exec call — very promising', contactId: contacts[19].id, dealId: deals[14].id, userId: alice.id },
    { type: ActivityType.EMAIL, description: 'Sent enterprise contract to Monsters Inc', contactId: contacts[16].id, dealId: deals[13].id, userId: carol.id },
    { type: ActivityType.CALL, description: 'Check-in call with Nakatomi Corp', contactId: contacts[17].id, userId: carol.id },
    { type: ActivityType.NOTE, description: 'Bluth Company exploring options — follow up in 30 days', contactId: contacts[9].id, userId: alice.id },
    { type: ActivityType.EMAIL, description: 'Welcome email sent to new Monsters Inc admin', contactId: contacts[16].id, userId: bob.id },
    { type: ActivityType.MEETING, description: 'Cyberdyne security review presentation', contactId: contacts[14].id, dealId: deals[12].id, userId: carol.id },
  ];

  await Promise.all(activitiesData.map(a => prisma.activity.create({ data: a })));

  console.log('✅ Seeded: 3 users, 20 contacts, 15 deals, 25 activities');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
