'use client';

import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function PaymentDrawer({
    isOpen,
    onClose,
    payments = [],
    payment,
    referralData,
    ujbBalance,
    paidTo = {},
    mapName,
    onRequestPayout,
    dealEverWon,
}) {
    if (!isOpen) return null;

    const agreedAmount = Number(payment?.agreedAmount || 0);
    const cosmoPaid = Number(payment?.cosmoPaid || 0);
    const agreedRemaining = Math.max(
        agreedAmount - cosmoPaid,
        0
    );

    const cosmoPayments = payments.filter(
        (p) => p.meta?.isCosmoToUjb === true
    );

    const payoutEntries = payments.filter(
        (p) => p.meta?.isUjbPayout === true
    );

    const getLogicalPaid = (cosmoPaymentId, slot) =>
        payoutEntries
            .filter(
                (p) =>
                    p.meta?.belongsToPaymentId === cosmoPaymentId &&
                    p.meta?.slot === slot
            )
            .reduce((sum, p) => {
                if (typeof p.meta?.logicalAmount === 'number') {
                    return sum + p.meta.logicalAmount;
                }

                const cash = Number(p.amountReceived || 0);
                const adj = Number(
                    p.meta?.adjustment?.deducted || 0
                );
                return sum + cash + adj;
            }, 0);

    const totalPayoutsDone =
        Number(paidTo.orbiter || 0) +
        Number(paidTo.orbiterMentor || 0) +
        Number(paidTo.cosmoMentor || 0);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Payments & Settlement"
        >
            <div className="space-y-6">
                {/* SUMMARY */}
                <Card>
                    <div className="space-y-4">
                        <Text variant="h3">Settlement Summary</Text>

                        <SummaryRow
                            label="Agreed Amount"
                            value={agreedAmount}
                        />
                        <SummaryRow
                            label="Cosmo Paid"
                            value={cosmoPaid}
                        />
                        <SummaryRow
                            label="Remaining"
                            value={agreedRemaining}
                        />
                        <SummaryRow
                            label="UJB Balance"
                            value={ujbBalance}
                        />
                        <SummaryRow
                            label="Payouts Done"
                            value={totalPayoutsDone}
                        />
                        <SummaryRow
                            label="Net Retained"
                            value={cosmoPaid - totalPayoutsDone}
                        />

                        <Button
                            variant="primary"
                            disabled={
                                !dealEverWon || agreedRemaining <= 0
                            }
                            onClick={payment.openPaymentModal}
                        >
                            Add Cosmo Payment
                        </Button>
                    </div>
                </Card>

                {/* COSMO PAYMENTS */}
                <div className="space-y-4">
                    {cosmoPayments.map((cp) => {
                        const pid = cp.paymentId;

                        const safeDate = cp.paymentDate
                            ? new Date(cp.paymentDate).toLocaleDateString(
                                'en-IN'
                            )
                            : '—';

                        const orbShare = Number(
                            cp.distribution?.orbiter || 0
                        );
                        const omShare = Number(
                            cp.distribution?.orbiterMentor || 0
                        );
                        const cmShare = Number(
                            cp.distribution?.cosmoMentor || 0
                        );

                        const orbPaid = getLogicalPaid(
                            pid,
                            'Orbiter'
                        );
                        const omPaid = getLogicalPaid(
                            pid,
                            'OrbiterMentor'
                        );
                        const cmPaid = getLogicalPaid(
                            pid,
                            'CosmoMentor'
                        );

                        return (
                            <Card key={pid}>
                                <div className="space-y-3">
                                    <Text variant="h3">
                                        ₹
                                        {Number(
                                            cp.amountReceived || 0
                                        ).toLocaleString('en-IN')}
                                    </Text>

                                    <Text variant="muted">
                                        {pid}
                                    </Text>

                                    <Text>
                                        <strong>From:</strong>{' '}
                                        {mapName(cp.paymentFrom)}
                                    </Text>

                                    <Text>
                                        <strong>Date:</strong> {safeDate}
                                    </Text>

                                    <SlotRow
                                        label="Orbiter"
                                        slotKey="Orbiter"
                                        totalShare={orbShare}
                                        paidSoFar={orbPaid}
                                        onRequestPayout={onRequestPayout}
                                        paymentId={pid}
                                    />

                                    <SlotRow
                                        label="Orbiter Mentor"
                                        slotKey="OrbiterMentor"
                                        totalShare={omShare}
                                        paidSoFar={omPaid}
                                        onRequestPayout={onRequestPayout}
                                        paymentId={pid}
                                    />

                                    <SlotRow
                                        label="Cosmo Mentor"
                                        slotKey="CosmoMentor"
                                        totalShare={cmShare}
                                        paidSoFar={cmPaid}
                                        onRequestPayout={onRequestPayout}
                                        paymentId={pid}
                                    />
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </Modal>
    );
}

function SummaryRow({ label, value }) {
    return (
        <div className="flex items-center justify-between">
            <Text variant="muted">{label}</Text>
            <Text>
                ₹{Number(value || 0).toLocaleString('en-IN')}
            </Text>
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

                {remaining > 0 && (
                    <Button
                        variant="primary"
                        onClick={() =>
                            onRequestPayout({
                                recipient: slotKey,
                                slotKey,
                                amount: remaining,
                                fromPaymentId: paymentId,
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
