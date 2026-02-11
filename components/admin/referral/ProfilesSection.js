'use client';

import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';

export default function ProfilesSection({
  orbiter,
  cosmoOrbiter,
  referralData,
}) {
  const totalEarnedOrbiter =
    Number(referralData?.paidToOrbiter || 0) +
    Number(referralData?.paidToOrbiterMentor || 0);

  const paidToCosmoMentor = Number(
    referralData?.paidToCosmoMentor || 0
  );

  const adjustmentRemaining =
    orbiter?.payment?.orbiter?.adjustmentRemaining ?? 0;

  return (
    <div className="space-y-6">
      {/* ORBITER */}
      {orbiter && (
        <Card>
          <div className="space-y-3">
            <Text variant="h3">Orbiter</Text>

            <Text>
              <strong>Name:</strong> {orbiter.name || '—'}
            </Text>

            <Text>
              <strong>UJB Code:</strong>{' '}
              {orbiter.UJBCode || orbiter.ujbCode || '—'}
            </Text>

            <Text>
              <strong>Phone:</strong>{' '}
              {orbiter.phone || '—'}
            </Text>

            <Text>
              <strong>Email:</strong>{' '}
              {orbiter.email || '—'}
            </Text>

            <Text>
              <strong>Mentor:</strong>{' '}
              {orbiter.mentorName || '—'}
            </Text>

            <Text>
              <strong>Total Earned (this referral):</strong>{' '}
              ₹
              {totalEarnedOrbiter.toLocaleString('en-IN')}
            </Text>

            {adjustmentRemaining > 0 && (
              <Text>
                <strong>Adjustment Remaining:</strong> ₹
                {Number(
                  adjustmentRemaining
                ).toLocaleString('en-IN')}
              </Text>
            )}
          </div>
        </Card>
      )}

      {/* COSMO ORBITER */}
      {cosmoOrbiter && (
        <Card>
          <div className="space-y-3">
            <Text variant="h3">Cosmo Orbiter</Text>

            <Text>
              <strong>Name:</strong>{' '}
              {cosmoOrbiter.name || '—'}
            </Text>

            <Text>
              <strong>UJB Code:</strong>{' '}
              {cosmoOrbiter.ujbCode ||
                cosmoOrbiter.UJBCode ||
                '—'}
            </Text>

            <Text>
              <strong>Phone:</strong>{' '}
              {cosmoOrbiter.phone || '—'}
            </Text>

            <Text>
              <strong>Email:</strong>{' '}
              {cosmoOrbiter.email || '—'}
            </Text>

            <Text>
              <strong>Mentor:</strong>{' '}
              {cosmoOrbiter.mentorName || '—'}
            </Text>

            <Text>
              <strong>Mentor Phone:</strong>{' '}
              {cosmoOrbiter.mentorPhone || '—'}
            </Text>

            <Text>
              <strong>Total Earned (Cosmo Mentor):</strong>{' '}
              ₹
              {paidToCosmoMentor.toLocaleString('en-IN')}
            </Text>
          </div>
        </Card>
      )}
    </div>
  );
}
