'use client';

import { useState } from 'react';

import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';

export default function PaymentHistorySection({
  payments = [],
  mapName,
  onRequestPayout,
}) {
  const [expanded, setExpanded] = useState(null);

  const safePayments = Array.isArray(payments)
    ? payments
    : Object.values(payments || {}).flat();

  const visiblePayments = safePayments.filter(
    (p) => p?.meta?.isCosmoToUjb || p?.meta?.isUjbPayout
  );

  const getPaidForSlot = (cosmoPaymentId, slot) =>
    visiblePayments
      .filter(
        (p) =>
          p?.meta?.isUjbPayout === true &&
          p?.meta?.belongsToPaymentId === cosmoPaymentId &&
          p?.meta?.slot === slot
      )
      .reduce((sum, p) => {
        if (typeof p?.meta?.logicalAmount === 'number') {
          return sum + p.meta.logicalAmount;
        }

        const net = Number(p?.amountReceived || 0);

        const tds =
          typeof p?.meta?.tdsAmount === 'number'
            ? p.meta.tdsAmount
            : 0;

        return sum + net + tds;
      }, 0);

  if (!visiblePayments.length) {
    return (
      <Card>
        <Text variant="muted">No payments yet.</Text>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {visiblePayments.map((pay, idx) => {
        const paymentId =
          pay?.paymentId ||
          pay?.meta?.paymentId ||
          pay?.meta?.belongsToPaymentId ||
          idx;

        const isCosmo = pay?.meta?.isCosmoToUjb === true;
        const isUjb = pay?.meta?.isUjbPayout === true;

        const logicalTotal =
          typeof pay?.grossAmount === 'number'
            ? pay.grossAmount
            : typeof pay?.meta?.logicalAmount === 'number'
            ? pay.meta.logicalAmount
            : Number(pay?.amountReceived || 0);

        return (
          <Card key={paymentId}>
            <div className="space-y-3">
              {/* HEADER */}
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="h3">
                    ₹
                    {Number(
                      logicalTotal || 0
                    ).toLocaleString('en-IN')}
                  </Text>

                  <Text variant="muted">
                    {paymentId}
                  </Text>
                </div>

                {isCosmo && (
                  <StatusBadge status="received" />
                )}

                {isUjb && (
                  <StatusBadge status="payout" />
                )}
              </div>

              {/* META */}
              <Text>
                <strong>From:</strong>{' '}
                {mapName?.(pay?.paymentFrom)}
              </Text>

              <Text>
                <strong>To:</strong>{' '}
                {mapName?.(
                  pay?.paymentTo || pay?.meta?.slot
                )}
              </Text>

              <Text>
                <strong>Date:</strong>{' '}
                {pay?.paymentDate || '—'}
              </Text>

              <Text>
                <strong>Mode:</strong>{' '}
                {pay?.modeOfPayment || '—'}
              </Text>

              {/* DISTRIBUTION */}
              {isCosmo && pay?.distribution && (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setExpanded(
                        expanded === paymentId
                          ? null
                          : paymentId
                      )
                    }
                  >
                    {expanded === paymentId
                      ? 'Hide Distribution'
                      : 'View Distribution'}
                  </Button>

                  {expanded === paymentId && (
                    <Card>
                      <div className="space-y-2">
                        <SlotRow
                          label="Orbiter"
                          slotKey="Orbiter"
                          totalShare={
                            pay.distribution.orbiter || 0
                          }
                          paidSoFar={getPaidForSlot(
                            paymentId,
                            'Orbiter'
                          )}
                          onRequestPayout={onRequestPayout}
                          paymentId={paymentId}
                        />

                        <SlotRow
                          label="Orbiter Mentor"
                          slotKey="OrbiterMentor"
                          totalShare={
                            pay.distribution
                              .orbiterMentor || 0
                          }
                          paidSoFar={getPaidForSlot(
                            paymentId,
                            'OrbiterMentor'
                          )}
                          onRequestPayout={onRequestPayout}
                          paymentId={paymentId}
                        />

                        <SlotRow
                          label="Cosmo Mentor"
                          slotKey="CosmoMentor"
                          totalShare={
                            pay.distribution
                              .cosmoMentor || 0
                          }
                          paidSoFar={getPaidForSlot(
                            paymentId,
                            'CosmoMentor'
                          )}
                          onRequestPayout={onRequestPayout}
                          paymentId={paymentId}
                        />
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function SlotRow({
  label,
  slotKey,
  totalShare,
  paidSoFar,
  onRequestPayout,
  paymentId,
}) {
  const total = Number(totalShare || 0);
  const paid = Number(paidSoFar || 0);
  const remaining = Math.max(total - paid, 0);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <Text>
            <strong>{label}</strong>
          </Text>
          <Text variant="muted">
            Paid: ₹{paid.toLocaleString('en-IN')}
          </Text>
          <Text variant="muted">
            Remaining: ₹
            {remaining.toLocaleString('en-IN')}
          </Text>
        </div>

        {remaining > 0 && onRequestPayout && (
          <Button
            variant="primary"
            onClick={() =>
              onRequestPayout({
                cosmoPaymentId: paymentId,
                slot: slotKey,
                amount: remaining,
              })
            }
          >
            Pay ₹{remaining.toLocaleString('en-IN')}
          </Button>
        )}
      </div>
    </Card>
  );
}
