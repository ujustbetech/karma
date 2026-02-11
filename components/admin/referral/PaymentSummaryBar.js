'use client';

import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

export default function PaymentSummaryBar({
  agreedAmount = 0,
  cosmoPaid = 0,
  agreedRemaining = 0,
  ujbBalance = 0,
  paidTo = {},
  referralData = {},
  onAddPayment,
}) {
  const logs = referralData?.dealLogs || [];
  const deal = logs.length ? logs[logs.length - 1] : {};

  const orbiterShare = deal?.orbiterShare ?? 0;
  const orbiterMentorShare = deal?.orbiterMentorShare ?? 0;
  const cosmoMentorShare = deal?.cosmoMentorShare ?? 0;
  const ujustbeShare = deal?.ujustbeShare ?? 0;

  const progress =
    agreedAmount > 0
      ? Math.round((cosmoPaid / agreedAmount) * 100)
      : 0;

  return (
    <Card>
      <div className="space-y-4">
        <Text variant="h3">Payments & Distribution</Text>

        {/* SUMMARY */}
        <div className="grid grid-cols-5 gap-4">
          <SummaryItem
            label="Agreed"
            value={agreedAmount}
          />
          <SummaryItem label="Paid" value={cosmoPaid} />
          <SummaryItem
            label="Remaining"
            value={agreedRemaining}
          />
          <SummaryItem
            label="Progress"
            value={`${progress}%`}
          />
          <SummaryItem
            label="UJB Balance"
            value={ujbBalance}
          />
        </div>

        {/* PROGRESS TEXT */}
        <Text variant="muted">
          {progress}% received
        </Text>

        {/* BREAKDOWN */}
        <Card>
          <div className="space-y-2">
            <Text variant="h3">
              Earnings Breakdown
            </Text>

            <BreakdownRow
              label="Orbiter"
              total={orbiterShare}
              paid={paidTo.orbiter}
            />

            <BreakdownRow
              label="Orbiter Mentor"
              total={orbiterMentorShare}
              paid={paidTo.orbiterMentor}
            />

            <BreakdownRow
              label="Cosmo Mentor"
              total={cosmoMentorShare}
              paid={paidTo.cosmoMentor}
            />

            <BreakdownRow
              label="UJustBe"
              total={ujustbeShare}
            />

            <BreakdownRow
              label="UJB Balance"
              total={ujbBalance}
            />
          </div>
        </Card>

        {/* ACTION */}
        <div>
          <Button
            variant="primary"
            onClick={onAddPayment}
            disabled={agreedRemaining <= 0}
          >
            Add Cosmo Payment
          </Button>
        </div>
      </div>
    </Card>
  );
}

function SummaryItem({ label, value }) {
  const isNumber = typeof value === 'number';

  return (
    <div>
      <Text variant="muted">{label}</Text>
      <Text variant="h3">
        {isNumber
          ? `₹${Number(value).toLocaleString('en-IN')}`
          : value}
      </Text>
    </div>
  );
}

function BreakdownRow({ label, total = 0, paid }) {
  return (
    <div className="flex items-center justify-between">
      <Text>{label}</Text>
      <Text>
        ₹{Number(total || 0).toLocaleString('en-IN')}
        {paid !== undefined && (
          <Text variant="muted">
            {' '}
            (Paid: ₹
            {Number(paid || 0).toLocaleString('en-IN')})
          </Text>
        )}
      </Text>
    </div>
  );
}
