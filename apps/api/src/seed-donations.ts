/**
 * One-shot: seed a demo fan account + a set of donations (some linked to that
 * fan, some guest/anonymous) so the donation page, leaderboard, admin donations
 * list, and the fan's /compte/dons, /compte/points, /compte/badges pages all
 * have real data to show.
 *
 * Run with: MONGODB_URI="mongodb://127.0.0.1:27017/usmo" npx tsx apps/api/src/seed-donations.ts
 */
import 'dotenv/config';
import mongoose, { Schema, model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

const userSchema = new Schema({
  name: String, firstName: String, lastName: String, email: String, password: String,
  role: String, status: String, phone: String, city: String, country: String,
  favoriteSport: String, newsletterOptIn: Boolean, emailVerified: Boolean,
  points: Number, privacySettings: Schema.Types.Mixed,
}, { timestamps: true });

const donationSchema = new Schema({
  amount: Number, currency: String, donorName: String, donorEmail: String,
  userId: Schema.Types.ObjectId, visibility: String, message: String,
  paymentStatus: String, paymentReference: String,
}, { timestamps: true });

const fanPointSchema = new Schema({
  userId: Schema.Types.ObjectId, points: Number, reason: String,
  sourceType: String, sourceId: String,
}, { timestamps: true });

const fanBadgeSchema = new Schema({
  userId: Schema.Types.ObjectId, badgeKey: String,
}, { timestamps: true });

const notificationSchema = new Schema({
  userId: Schema.Types.ObjectId, type: String, title: String, message: String,
  link: String, isRead: Boolean,
}, { timestamps: true });

const badgeSchema = new Schema({
  key: String, name: String, nameAr: String, description: String, descriptionAr: String,
  icon: String, displayOrder: Number, isActive: Boolean,
}, { timestamps: true });

const UserModel = model('User', userSchema);
const DonationModel = model('Donation', donationSchema);
const FanPointModel = model('FanPoint', fanPointSchema);
const FanBadgeModel = model('FanBadge', fanBadgeSchema, 'fanbadges');
const NotificationModel = model('UserNotification', notificationSchema, 'usernotifications');
const BadgeModel = model('Badge', badgeSchema);

const FAN_EMAIL = 'fan@usmonastir.tn';
const FAN_PASSWORD = 'fanpassword123';

async function bootstrap() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/usmo';
  await mongoose.connect(uri);
  console.log('[seed-donations] Connected to MongoDB');

  // 1. Fan account
  let fan = await UserModel.findOne({ email: FAN_EMAIL });
  if (!fan) {
    const hashed = await bcrypt.hash(FAN_PASSWORD, 10);
    fan = await UserModel.create({
      name: 'Ahmed Trabelsi',
      firstName: 'Ahmed',
      lastName: 'Trabelsi',
      email: FAN_EMAIL,
      password: hashed,
      role: 'Fan',
      status: 'Active',
      phone: '25123456',
      city: 'Monastir',
      country: 'Tunisie',
      favoriteSport: 'football',
      newsletterOptIn: true,
      emailVerified: true,
      privacySettings: {
        showProfilePublicly: true,
        showCity: true,
        showRanking: true,
        showDonationBadge: true,
        showDonationAmount: true,
        useNickname: false,
      },
    });
    console.log(`[seed-donations] Created fan account: ${FAN_EMAIL} / ${FAN_PASSWORD}`);
  } else {
    console.log(`[seed-donations] Fan account already exists: ${FAN_EMAIL}`);
  }

  // 2. Clear this seed's previous donations (identified by a marker message prefix) to stay idempotent
  await DonationModel.deleteMany({ paymentReference: { $regex: '^SEED-' } });
  await FanPointModel.deleteMany({ sourceType: 'donation', reason: 'donation', sourceId: { $exists: true }, userId: fan._id });

  const donations = [
    { amount: 50, currency: 'TND', donorName: fan.name, donorEmail: fan.email, userId: fan._id, visibility: 'public', message: "Allez l'USM, toujours avec vous !", paymentStatus: 'completed', paymentReference: 'SEED-001' },
    { amount: 120, currency: 'TND', donorName: fan.name, donorEmail: fan.email, userId: fan._id, visibility: 'public', message: 'Pour la rénovation du stade.', paymentStatus: 'completed', paymentReference: 'SEED-002' },
    { amount: 30, currency: 'TND', donorName: 'Sami Ben Ali', donorEmail: 'sami.benali@example.tn', visibility: 'public', message: 'Bon courage pour la saison !', paymentStatus: 'completed', paymentReference: 'SEED-003' },
    { amount: 200, currency: 'TND', donorName: 'Donateur Anonyme', donorEmail: 'anonyme@example.tn', visibility: 'anonymous', paymentStatus: 'completed', paymentReference: 'SEED-004' },
    { amount: 500, currency: 'TND', donorName: 'Fedia Sponsoring SARL', donorEmail: 'contact@fedia-sponsoring.tn', visibility: 'public', message: 'Soutien officiel de la section basketball.', paymentStatus: 'completed', paymentReference: 'SEED-005' },
    { amount: 75, currency: 'TND', donorName: 'Karim Jendoubi', donorEmail: 'karim.jendoubi@example.tn', visibility: 'public', paymentStatus: 'pending', paymentReference: 'SEED-006' },
  ];

  const inserted = await DonationModel.insertMany(donations);
  console.log(`[seed-donations] Inserted ${inserted.length} donations`);

  // 3. Replicate DonationsService.confirm() side effects for the fan's completed donations
  //    (points ledger + donor badge + notifications) so /compte pages are consistent.
  const fanCompleted = inserted.filter((d: any) => d.userId?.toString() === fan!._id.toString() && d.paymentStatus === 'completed');
  let totalPoints = 0;
  for (const donation of fanCompleted) {
    await FanPointModel.create({
      userId: fan._id,
      points: donation.amount,
      reason: 'donation',
      sourceType: 'donation',
      sourceId: donation._id.toString(),
    });
    totalPoints += donation.amount;

    await NotificationModel.create({
      userId: fan._id,
      type: 'donation_status',
      title: 'Don confirmé',
      message: `Votre don de ${donation.amount} ${donation.currency} a été confirmé. Merci pour votre soutien !`,
      link: '/compte/dons',
      isRead: false,
    });
  }

  if (totalPoints > 0) {
    await UserModel.findByIdAndUpdate(fan._id, { $inc: { points: totalPoints } });
  }

  const donorBadge = await BadgeModel.findOne({ key: 'donor' });
  if (donorBadge && fanCompleted.length > 0) {
    const existing = await FanBadgeModel.findOne({ userId: fan._id, badgeKey: 'donor' });
    if (!existing) {
      await FanBadgeModel.create({ userId: fan._id, badgeKey: 'donor' });
      await NotificationModel.create({
        userId: fan._id,
        type: 'badge_unlocked',
        title: 'Nouveau badge débloqué',
        message: `Vous avez débloqué le badge "${donorBadge.name}".`,
        link: '/compte/badges',
        isRead: false,
      });
      console.log('[seed-donations] Unlocked "donor" badge for the fan');
    }
  } else if (!donorBadge) {
    console.log('[seed-donations] Skipped donor badge unlock — Badge catalog not seeded yet. Run seed-loyalty.ts first.');
  }

  console.log(`[seed-donations] Awarded ${totalPoints} points to ${FAN_EMAIL}`);
  await mongoose.disconnect();
  console.log('[seed-donations] Done ✅');
}

bootstrap().catch((err) => {
  console.error('[seed-donations] Failed:', err);
  process.exit(1);
});
