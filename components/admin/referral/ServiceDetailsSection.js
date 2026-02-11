'use client';

import { useEffect, useMemo, useState } from 'react';

import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';

import { buildDealDistribution } from '@/utils/referralCalculations';

export default function ServiceDetailsSection({
  referralData,
  dealLogs,
  onSaveDealLog,
}) {
  const [dealValue, setDealValue] = useState('');
  const [saving, setSaving] = useState(false);

  const isDealLocked =
    referralData?.dealStatus === 'Agreed % Transferred to UJustBe' ||
    referralData?.dealStatus ===
      'Agreed Percentage Transferred to UJustBe' ||
    referralData?.statusLogs?.some(
      (s) => s.status === 'Agreed % Transferred to UJustBe'
    ) ||
    referralData?.dealLogs?.some(
      (log) =>
        log.dealStatus === 'Agreed % Transferred to UJustBe'
    );

  const latestDealLog =
    referralData?.dealLogs?.length > 0
      ? referralData.dealLogs[
          referralData.dealLogs.length - 1
        ]
      : null;

  useEffect(() => {
    if (latestDealLog?.dealValue) {
      setDealValue(latestDealLog.dealValue);
    }
  }, [latestDealLog]);

  const previewDistribution = useMemo(() => {
    if (isDealLocked && latestDealLog) {
      return {
        agreedAmount: latestDealLog.agreedAmount,
        orbiterShare: latestDealLog.orbiterShare,
        orbiterMentorShare:
          latestDealLog.orbiterMentorShare,
        cosmoMentorShare:
          latestDealLog.cosmoMentorShare,
        ujustbeShare: latestDealLog.ujustbeShare,
      };
    }

    const valueNum = Number(dealValue);
    if (!valueNum || valueNum <= 0) return null;

    return buildDealDistribution(valueNum, referralData);
  }, [dealValue, referralData, isDealLocked, latestDealLog]);

  const handleSave = async () => {
    if (isDealLocked) return;
    if (!previewDistribution) return;

    setSaving(true);
    try {
      await onSaveDealLog({
        ...previewDistribution,
        dealValue: Number(dealValue),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <div className="space-y-4">
        <Text variant="h3">
          Service / Product Details
        </Text>

        <FormField label="Deal Value (₹)">
          <Input
            type="number"
            value={dealValue}
            onChange={(e) =>
              setDealValue(e.target.value)
            }
            disabled={isDealLocked}
          />
        </FormField>

        {previewDistribution && (
          <Card>
            <div className="space-y-2">
              <Text variant="h3">
                {isDealLocked
                  ? 'Final Distribution'
                  : 'Distribution Preview'}
              </Text>

              <Text>
                <strong>Total Agreed Amount:</strong> ₹
                {Number(
                  previewDistribution.agreedAmount || 0
                ).toLocaleString('en-IN')}
              </Text>

              <Text>
                Orbiter: ₹
                {Number(
                  previewDistribution.orbiterShare || 0
                ).toLocaleString('en-IN')}
              </Text>

              <Text>
                Orbiter Mentor: ₹
                {Number(
                  previewDistribution.orbiterMentorShare ||
                    0
                ).toLocaleString('en-IN')}
              </Text>

              <Text>
                Cosmo Mentor: ₹
                {Number(
                  previewDistribution.cosmoMentorShare || 0
                ).toLocaleString('en-IN')}
              </Text>

              <Text>
                UJustBe: ₹
                {Number(
                  previewDistribution.ujustbeShare || 0
                ).toLocaleString('en-IN')}
              </Text>
            </div>
          </Card>
        )}

        {!isDealLocked && (
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? 'Saving…'
              : dealLogs?.length
              ? 'Update Deal Calculation'
              : 'Save Deal Calculation'}
          </Button>
        )}

        {isDealLocked && (
          <Text variant="muted">
            Deal locked. Agreed percentage already
            transferred to UJustBe.
          </Text>
        )}
      </div>
    </Card>
  );
}
