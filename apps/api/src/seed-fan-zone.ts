import 'dotenv/config';
import mongoose from 'mongoose';
import { Schema, model, Types } from 'mongoose';

const fanVoteSchema = new Schema({
  title: { type: String, required: true },
  isActive: { type: Boolean, default: false, index: true },
  options: [{
    key: { type: String, required: true },
    label: { type: String, required: true }
  }],
}, { timestamps: true });

const fanPointSchema = new Schema({
  userId: { type: Types.ObjectId, required: true, index: true },
  points: { type: Number, required: true },
  reason: { type: String, required: true },
}, { timestamps: true });

const FanVoteModel = model('FanVote', fanVoteSchema, 'fanvotes');
const FanPointModel = model('FanPoint', fanPointSchema, 'fanpoints');
const UserModel = model('User', new Schema({
  name: String,
  email: String,
  privacySettings: {
    showRanking: { type: Boolean, default: true },
    useNickname: { type: Boolean, default: false },
    showCity: { type: Boolean, default: true },
  },
  points: { type: Number, default: 0 }
}), 'users');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('[seed-fan-zone] Connected to MongoDB');

  // 1. Wipe existing
  await FanVoteModel.deleteMany({});
  await FanPointModel.deleteMany({});
  console.log('[seed-fan-zone] Wiped existing votes and points');

  // 2. Create Active Poll
  const activePoll = new FanVoteModel({
    title: 'Qui a été le meilleur joueur lors du derby face à l\'Espérance ?',
    isActive: true,
    options: [
      { key: 'alimi', label: 'Adem Alimi (Auteur du but décisif)' },
      { key: 'yeddes', label: 'Sadok Yeddes (Arrêts réflexes décisifs)' },
      { key: 'orkuma', label: 'Moses Orkuma (Domination au milieu)' },
      { key: 'chabbi', label: 'Lassaad Chabbi (Choix tactiques gagnants)' }
    ]
  });
  await activePoll.save();
  console.log('[seed-fan-zone] Created active derby poll');

  // 3. Find some mock users or register/insert mock ranking points
  const users = await UserModel.find({}).limit(5).exec();
  
  if (users.length > 0) {
    const reasons = ['daily_mission', 'vote_cast', 'quiz_completed', 'prediction_win'];
    for (const user of users) {
      // Seed between 3 to 6 point logs for each user
      const logsCount = Math.floor(Math.random() * 4) + 3;
      for (let i = 0; i < logsCount; i++) {
        const pts = [50, 100, 150, 200][Math.floor(Math.random() * 4)];
        const pointLog = new FanPointModel({
          userId: user._id,
          points: pts,
          reason: reasons[Math.floor(Math.random() * reasons.length)],
        });
        await pointLog.save();
      }
    }
    console.log(`[seed-fan-zone] Seeded mock ledger points for ${users.length} existing users`);
  } else {
    // If no users exist, create temporary mock user points
    console.log('[seed-fan-zone] No users found. Skipping rankings population.');
  }

  await mongoose.disconnect();
  console.log('[seed-fan-zone] Done ✅');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
