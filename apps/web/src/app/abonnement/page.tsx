'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { tr } from '../../utils/i18n';
import { api } from '../../lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck, CreditCard, Check, AlertCircle, Sparkles, Loader2, ArrowRight,
  Tag, Zap, Trophy, Award, Tv, Vote,
} from 'lucide-react';

interface Plan {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  durationDays: number;
  benefits: string[];
  badge?: string;
  color?: string;
  isActive: boolean;
}

export default function AbonnementPage() {
  const { isLoggedIn, language, showToast, fan } = useApp();
  const router = useRouter();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [myMembership, setMyMembership] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Active-member dashboard data
  const [points, setPoints] = useState(0);
  const [rankings, setRankings] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [perksLoading, setPerksLoading] = useState(true);

  const fetchPlansAndStatus = async () => {
    try {
      const plansData = await api.getMembershipPlans();
      setPlans(plansData || []);

      if (isLoggedIn) {
        const memData = await api.getMyMembership();
        setMyMembership(memData);
      }
    } catch (err) {
      console.error('Error fetching subscription data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberPerks = async () => {
    setPerksLoading(true);
    try {
      const [dashboard, rankingList, badgeList] = await Promise.all([
        api.getFanZoneDashboard(),
        api.getFanRanking(),
        api.getMyBadges(),
      ]);
      setPoints(dashboard?.points || 0);
      setRankings(Array.isArray(rankingList) ? rankingList : []);
      setBadges(Array.isArray(badgeList) ? badgeList : []);
    } catch (err) {
      console.error('Error fetching member perks:', err);
    } finally {
      setPerksLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const plansData = await api.getMembershipPlans();
        if (active) setPlans(plansData || []);

        if (isLoggedIn) {
          const memData = await api.getMyMembership();
          if (active) setMyMembership(memData);
        }
      } catch (err) {
        console.error('Error fetching subscription data:', err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [isLoggedIn]);

  useEffect(() => {
    let active = true;
    if (isLoggedIn && myMembership?.active) {
      setPerksLoading(true);
      Promise.all([
        api.getFanZoneDashboard(),
        api.getFanRanking(),
        api.getMyBadges(),
      ])
        .then(([dashboard, rankingList, badgeList]) => {
          if (!active) return;
          setPoints(dashboard?.points || 0);
          setRankings(Array.isArray(rankingList) ? rankingList : []);
          setBadges(Array.isArray(badgeList) ? badgeList : []);
        })
        .catch((err) => {
          console.error('Error fetching member perks:', err);
        })
        .finally(() => {
          if (active) setPerksLoading(false);
        });
    }
    return () => { active = false; };
  }, [isLoggedIn, myMembership?.active]);

  const handleSubscribeClick = (plan: Plan) => {
    if (!isLoggedIn) {
      showToast(
        tr(language, 'Please log in to subscribe.', 'Veuillez vous connecter pour souscrire.', 'يرجى تسجيل الدخول للاشتراك.'),
        'info'
      );
      router.push('/auth/login');
      return;
    }
    setSelectedPlan(plan);
    setShowConfirmModal(true);
  };

  const handleConfirmSubscription = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    try {
      await api.requestMembership({ planId: selectedPlan._id });
      showToast(
        tr(language, 'Subscription request submitted!', 'Demande d\'abonnement soumise !', 'تم إرسال طلب الاشتراك!'),
        'success'
      );
      setShowConfirmModal(false);
      await fetchPlansAndStatus();
    } catch (err: any) {
      showToast(err.message || 'Error submitting request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="text-usm-blue-primary animate-spin" />
          <span className="text-xs text-slate-500 font-semibold tracking-wider">Chargement des abonnements...</span>
        </div>
      </div>
    );
  }

  const isPending = myMembership?.status === 'pending';
  const isActive = myMembership?.active;

  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.06),transparent_50%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-display font-black text-usm-blue-dark uppercase tracking-wider">
            {tr(language, 'MEMBERSHIP & SUBSCRIPTIONS', 'ABONNEMENTS US MONASTIR', 'الاشتراكات والانخراط')}
          </h1>
          <p className="text-xs text-usm-blue-primary uppercase font-bold tracking-widest mt-2">
            {tr(language, 'SUPPORT YOUR CLUB, ACCESS EXCLUSIVE CONTENT', 'SOUTENEZ LE CLUB, DÉBLOQUEZ LA FAN ZONE', 'ادعم ناديك، افتح منطقة الأحباء')}
          </p>
        </div>

        {/* Current status header alert */}
        {isLoggedIn && (isActive || isPending) && (
          <div className="mb-12 max-w-3xl mx-auto">
            {isActive ? (
              <div className="space-y-5">
                {/* Status banner */}
                <div className="usm-card border border-emerald-500/25 bg-emerald-500/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <ShieldCheck size={24} className="text-emerald-400" />
                    </div>
                    <div className="text-center sm:text-left rtl:text-right">
                      <h4 className="text-sm font-bold text-usm-blue-dark uppercase tracking-wider">
                        {tr(language, 'Active Abonnement', 'Abonnement Actif', 'اشتراك نشط')} — {myMembership.plan}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {tr(
                          language,
                          `You have ${myMembership.daysRemaining} days remaining. Expiry date: ${new Date(myMembership.endDate).toLocaleDateString('fr-FR')}`,
                          `Il vous reste ${myMembership.daysRemaining} jours. Expiry : ${new Date(myMembership.endDate).toLocaleDateString('fr-FR')}`,
                          `متبقي لديك ${myMembership.daysRemaining} يوماً. تاريخ الانتهاء: ${new Date(myMembership.endDate).toLocaleDateString('fr-FR')}`
                        )}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/compte/carte-supporter"
                    className="usm-btn-secondary px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-usm-border hover:bg-usm-blue-soft transition-all text-usm-blue-dark shrink-0"
                  >
                    {tr(language, 'View Supporter Card', 'Ma Carte Supporter', 'بطاقة المشجع')}
                  </Link>
                </div>

                {/* Member perks dashboard */}
                {perksLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 size={22} className="animate-spin text-usm-blue-primary" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Boutique discount */}
                    {myMembership.memberDiscountPercent > 0 && (
                      <Link href="/boutique" className="usm-card border border-usm-accent-gold/30 bg-gradient-to-br from-white to-[#FFFBEF] p-5 flex flex-col gap-2 hover:border-usm-accent-gold/60 transition-colors group">
                        <div className="flex items-center justify-between">
                          <div className="h-9 w-9 rounded-lg bg-usm-accent-gold/15 border border-usm-accent-gold/30 flex items-center justify-center text-usm-accent-gold">
                            <Tag size={16} />
                          </div>
                          <span className="text-2xl font-mono font-black text-usm-accent-gold">-{myMembership.memberDiscountPercent}%</span>
                        </div>
                        <p className="text-xs font-bold text-usm-blue-dark uppercase tracking-wider">
                          {tr(language, 'Boutique Discount', 'Réduction Boutique', 'خصم على المتجر')}
                        </p>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          {tr(
                            language,
                            'Applied automatically at checkout — no code needed.',
                            'Appliquée automatiquement à la caisse, sans code promo.',
                            'يُطبّق تلقائياً عند الدفع، بدون الحاجة لرمز ترويجي.'
                          )}
                        </p>
                        <span className="mt-auto text-[9px] font-black uppercase text-usm-accent-gold flex items-center gap-1 group-hover:gap-2 transition-all">
                          {tr(language, 'Shop Now', 'Voir la boutique', 'زيارة المتجر')} <ArrowRight size={11} />
                        </span>
                      </Link>
                    )}

                    {/* Blue points */}
                    <Link href="/compte/points" className="usm-card border border-usm-border p-5 flex flex-col gap-2 hover:border-usm-blue-primary/40 transition-colors group">
                      <div className="flex items-center justify-between">
                        <div className="h-9 w-9 rounded-lg bg-usm-blue-primary/10 border border-usm-blue-primary/30 flex items-center justify-center text-usm-blue-primary">
                          <Zap size={16} className="fill-current" />
                        </div>
                        <span className="text-2xl font-mono font-black text-usm-blue-dark">{points}</span>
                      </div>
                      <p className="text-xs font-bold text-usm-blue-dark uppercase tracking-wider">
                        {tr(language, 'Blue Points', 'Points Bleus', 'النقاط الزرقاء')}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        {tr(language, 'Earn points, redeem real rewards.', 'Gagnez des points, échangez-les contre des récompenses.', 'اجمع النقاط واستبدلها بمكافآت حقيقية.')}
                      </p>
                      <span className="mt-auto text-[9px] font-black uppercase text-usm-blue-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                        {tr(language, 'View History', 'Voir l\'historique', 'عرض السجل')} <ArrowRight size={11} />
                      </span>
                    </Link>

                    {/* Leaderboard */}
                    <Link href="/fanzone" className="usm-card border border-usm-border p-5 flex flex-col gap-2 hover:border-usm-blue-primary/40 transition-colors group">
                      <div className="flex items-center justify-between">
                        <div className="h-9 w-9 rounded-lg bg-usm-blue-primary/10 border border-usm-blue-primary/30 flex items-center justify-center text-usm-blue-primary">
                          <Trophy size={16} />
                        </div>
                        {(() => {
                          const myRank = rankings.find((r) => r.userId === fan?._id);
                          return (
                            <span className="text-2xl font-mono font-black text-usm-blue-dark">
                              {myRank ? `#${myRank.rank}` : '—'}
                            </span>
                          );
                        })()}
                      </div>
                      <p className="text-xs font-bold text-usm-blue-dark uppercase tracking-wider">
                        {tr(language, 'Supporter Ranking', 'Classement Supporters', 'ترتيب الأنصار')}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        {tr(language, 'See how you rank among fellow members.', 'Voyez votre position parmi les autres membres.', 'اطّلع على ترتيبك بين باقي الأعضاء.')}
                      </p>
                      <span className="mt-auto text-[9px] font-black uppercase text-usm-blue-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                        {tr(language, 'Full Leaderboard', 'Classement complet', 'الترتيب الكامل')} <ArrowRight size={11} />
                      </span>
                    </Link>

                    {/* Badges */}
                    <Link href="/compte/badges" className="usm-card border border-usm-border p-5 flex flex-col gap-2 hover:border-usm-blue-primary/40 transition-colors group">
                      <div className="flex items-center justify-between">
                        <div className="h-9 w-9 rounded-lg bg-usm-blue-primary/10 border border-usm-blue-primary/30 flex items-center justify-center text-usm-blue-primary">
                          <Award size={16} />
                        </div>
                        <span className="text-2xl font-mono font-black text-usm-blue-dark">
                          {badges.filter((b) => b.unlocked).length}/{badges.length}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-usm-blue-dark uppercase tracking-wider">
                        {tr(language, 'Badges', 'Mes Badges', 'أوسمتي')}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        {tr(language, 'Unlock distinctions as you support the club.', 'Débloquez des distinctions en soutenant le club.', 'افتح أوسمة مميزة أثناء دعمك للنادي.')}
                      </p>
                      <span className="mt-auto text-[9px] font-black uppercase text-usm-blue-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                        {tr(language, 'View Badges', 'Voir mes badges', 'عرض الأوسمة')} <ArrowRight size={11} />
                      </span>
                    </Link>

                    {/* USM Media Premium */}
                    <Link href="/media" className="usm-card border border-usm-border p-5 flex flex-col gap-2 hover:border-usm-blue-primary/40 transition-colors group">
                      <div className="flex items-center justify-between">
                        <div className="h-9 w-9 rounded-lg bg-usm-blue-primary/10 border border-usm-blue-primary/30 flex items-center justify-center text-usm-blue-primary">
                          <Tv size={16} />
                        </div>
                        <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                          {tr(language, 'Unlocked', 'Débloqué', 'مفتوح')}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-usm-blue-dark uppercase tracking-wider">
                        {tr(language, 'USM Media Premium', 'USM Media Premium', 'USM Media بريميوم')}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        {tr(language, 'Unlimited access to exclusive photos & videos.', 'Accès illimité aux photos et vidéos exclusives.', 'وصول غير محدود للصور والفيديوهات الحصرية.')}
                      </p>
                      <span className="mt-auto text-[9px] font-black uppercase text-usm-blue-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                        {tr(language, 'Explore Media', 'Explorer les médias', 'استكشاف الوسائط')} <ArrowRight size={11} />
                      </span>
                    </Link>

                    {/* Man of the Match voting */}
                    <Link href="/fanzone" className="usm-card border border-usm-border p-5 flex flex-col gap-2 hover:border-usm-blue-primary/40 transition-colors group">
                      <div className="flex items-center justify-between">
                        <div className="h-9 w-9 rounded-lg bg-usm-blue-primary/10 border border-usm-blue-primary/30 flex items-center justify-center text-usm-blue-primary">
                          <Vote size={16} />
                        </div>
                      </div>
                      <p className="text-xs font-bold text-usm-blue-dark uppercase tracking-wider">
                        {tr(language, 'Man of the Match Vote', 'Vote Homme du Match', 'تصويت رجل المباراة')}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        {tr(language, 'Vote and earn points at every poll.', 'Votez et gagnez des points à chaque sondage.', 'صوّت واكسب نقاطاً في كل استطلاع.')}
                      </p>
                      <span className="mt-auto text-[9px] font-black uppercase text-usm-blue-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                        {tr(language, 'Go to Fan Zone', 'Aller à la Fan Zone', 'الذهاب لمنطقة الأنصار')} <ArrowRight size={11} />
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="usm-card border border-usm-blue-primary/30 bg-usm-blue-primary/5 p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-usm-blue-primary/10 border border-usm-blue-primary/30 flex items-center justify-center shrink-0">
                    <AlertCircle size={20} className="text-usm-blue-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-usm-blue-dark uppercase tracking-wider">
                      {tr(language, 'Subscription Request Pending', 'Demande d\'abonnement en attente', 'طلب الاشتراك قيد الانتظار')}
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                      {tr(
                        language,
                        'Your request is pending validation. Please complete the bank transfer below, and the club administration will activate your access.',
                        'Votre demande est en cours de validation. Veuillez effectuer le règlement et notre équipe activera vos accès sous peu.',
                        'طلبك قيد الانتظار. يرجى إتمام عملية الدفع وسيقوم الفريق بتفعيل اشتراكك قريباً.'
                      )}
                    </p>
                  </div>
                </div>
                
                {/* Bank Details */}
                <div className="p-4 bg-white/70 border border-usm-border rounded-xl text-xs space-y-2">
                  <p className="font-bold text-usm-blue-dark border-b border-usm-border pb-2 mb-2 uppercase tracking-wider text-[10px]">
                    {tr(language, 'Club Bank Details', 'Coordonnées Bancaires du Club', 'بيانات الدفع البنكي')}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-500">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-500">Titulaire du compte :</span>
                      <span className="text-usm-blue-dark font-medium">Union Sportive Monastirienne</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-500">RIB :</span>
                      <span className="text-usm-blue-dark font-mono font-bold">12 345 6789012345678 90</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isVIP = plan.slug.includes('vip');
            const isGold = plan.slug.includes('gold');
            return (
              <div
                key={plan._id}
                className={`usm-card border flex flex-col justify-between overflow-hidden shadow-2xl relative ${
                  isGold
                    ? 'border-usm-blue-primary bg-gradient-to-b from-white via-usm-blue-soft to-white'
                    : 'border-usm-border'
                }`}
              >
                {/* Gold Highlight Badge */}
                {isGold && (
                  <div className="absolute top-4 right-4 bg-usm-blue-primary text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <Sparkles size={8} />
                    <span>Popular</span>
                  </div>
                )}

                <div className="p-6">
                  {/* Plan Accent color header bar */}
                  <div className="h-1.5 w-full -mx-6 -mt-6 mb-6" style={{ backgroundColor: plan.color || '#0D63FF' }} />
                  
                  <h3 className="text-xl font-display font-black text-usm-blue-dark uppercase tracking-wider">{plan.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-2 min-h-[44px] leading-relaxed">{plan.description}</p>
                  
                  {/* Pricing Info */}
                  <div className="mt-5 border-b border-usm-border pb-5">
                    <span className="text-3xl font-mono font-black text-usm-blue-primary">
                      {Math.round(plan.price / 1000)}
                    </span>
                    <span className="text-xs font-bold text-slate-600 ml-1.5">TND</span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider ml-2">/ An</span>
                  </div>

                  {/* Benefits checklist */}
                  <ul className="mt-6 space-y-3.5">
                    {plan.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 leading-snug">
                        <span className="mt-0.5 text-usm-blue-primary shrink-0">
                          <Check size={14} />
                        </span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 border-t border-usm-border">
                  <button
                    onClick={() => handleSubscribeClick(plan)}
                    disabled={isActive || isPending}
                    className={`w-full py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                      isActive || isPending
                        ? 'bg-usm-blue-soft text-slate-500 border border-usm-border cursor-not-allowed'
                        : isGold
                        ? 'bg-usm-blue-primary text-white hover:bg-usm-blue-hover hover:text-white'
                        : 'bg-usm-blue-soft text-usm-blue-dark border border-usm-border hover:bg-usm-blue-hover hover:text-white'
                    }`}
                  >
                    {isActive ? (
                      <span>{tr(language, 'Already Subscribed', 'Déjà Abonné', 'مشترك بالفعل')}</span>
                    ) : isPending ? (
                      <span>{tr(language, 'Request Pending', 'Demande en attente', 'طلبك قيد الانتظار')}</span>
                    ) : (
                      <>
                        <span>{tr(language, 'Subscribe', 'Souscrire', 'اشتراك')}</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedPlan && (
        <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white border border-usm-blue-primary/20 rounded-2xl shadow-2xl p-6 text-center overflow-hidden">
            <div className="h-14 w-14 rounded-full bg-usm-blue-primary/10 border border-usm-blue-primary/30 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="text-usm-blue-primary" size={24} />
            </div>

            <h3 className="text-lg font-display font-black text-usm-blue-dark uppercase tracking-wider">
              {tr(language, 'Confirm Subscription', 'Confirmer la Demande', 'تأكيد طلب الاشتراك')}
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              {tr(
                language,
                `You are requesting a subscription to the "${selectedPlan.name}" plan for ${Math.round(selectedPlan.price / 1000)} TND / year.`,
                `Vous allez demander une souscription au plan « ${selectedPlan.name} » pour ${Math.round(selectedPlan.price / 1000)} DT / an.`,
                `أنت بصدد طلب الاشتراك في باقة "${selectedPlan.name}" بقيمة ${Math.round(selectedPlan.price / 1000)} دينار / سنويّاً.`
              )}
            </p>

            <div className="my-5 p-3.5 bg-white border border-usm-border rounded-xl text-xs text-slate-500 text-left leading-relaxed">
              <p className="font-bold text-usm-blue-dark text-[10px] uppercase mb-1">{tr(language, 'Payment Info:', 'Règlement :', 'الدفع :')}</p>
              {tr(
                language,
                'Subscription activation is manual. After confirmation, you can pay via bank transfer or cash at the club, and the administrator will activate your access.',
                'L\'activation est manuelle. Après validation, vous pourrez payer par virement ou espèces au club pour que l\'administration active votre pass.',
                'تفعيل الاشتراك يتم يدوياً. بعد التأكيد، يمكنك الدفع عبر تحويل بنكي أو نقداً في مقر النادي، وسيقوم المشرف بتفعيل حسابك.'
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl bg-usm-blue-soft border border-usm-border text-usm-blue-dark hover:bg-usm-blue-soft transition-colors cursor-pointer"
              >
                {tr(language, 'Cancel', 'Annuler', 'إلغاء')}
              </button>
              <button
                onClick={handleConfirmSubscription}
                disabled={submitting}
                className="flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl bg-usm-blue-primary text-white hover:bg-usm-blue-hover hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {submitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <span>{tr(language, 'Confirm', 'Confirmer', 'تأكيد')}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
