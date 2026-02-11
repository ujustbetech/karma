'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';

import AdminLayout from '@/components/layout/AdminLayout';
import Text from '@/components/ui/Text';
import Card from '@/components/ui/Card';

import StatusSection from '@/components/admin/referral/StatusSection';
import ServiceDetailsSection from '@/components/admin/referral/ServiceDetailsSection';
import ProfilesSection from '@/components/admin/referral/ProfilesSection';
import PaymentHistorySection from '@/components/admin/referral/PaymentHistorySection';
import PaymentSummaryBar from '@/components/admin/referral/PaymentSummaryBar';
import PaymentDrawer from '@/components/admin/referral/PaymentDrawer';
import FollowupSection from '@/components/admin/referral/FollowupSection';

import useReferralDetails from '@/hooks/useReferralDetails';
import useReferralPayments from '@/hooks/useReferralPayments';
import { useUjbDistribution } from '@/hooks/useUjbDistribution';
import { useReferralAdjustment } from '@/hooks/useReferralAdjustment';
import Modal from '@/components/ui/Modal';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import DateInput from '@/components/ui/DateInput';
import Button from '@/components/ui/Button';

export default function ReferralDetailsPage() {
    const { id } = useParams();

    const {
        loading,
        referralData,
        orbiter,
        cosmoOrbiter,
        payments,
        setPayments,
        followups,
        formState,
        setFormState,
        dealLogs,
        dealAlreadyCalculated,
        dealEverWon,
        handleStatusUpdate,
        handleSaveDealLog,
        addFollowup,
        editFollowup,
        deleteFollowup,
    } = useReferralDetails(id);

    const payment = useReferralPayments({
        id,
        referralData,
        payments,
        setPayments,
        dealLogs,
    });

    const ujb = useUjbDistribution({
        referralId: id,
        referralData,
        payments,
        onPaymentsUpdate: setPayments,
        orbiter,
        cosmoOrbiter,
    });

    const primaryOrbiterUjb =
        referralData?.orbiterUJBCode ||
        orbiter?.ujbCode ||
        orbiter?.UJBCode ||
        null;

    const adjustment = useReferralAdjustment(id, primaryOrbiterUjb);

    const [showPaymentDrawer, setShowPaymentDrawer] = useState(false);
    const [payoutRequest, setPayoutRequest] = useState(null);

    const [payoutModal, setPayoutModal] = useState({
        open: false,
        slot: '',
        amount: 0,
        fromPaymentId: null,
        modeOfPayment: '',
        transactionRef: '',
        paymentDate: new Date().toISOString().split('T')[0],
        processing: false,
    });

    const mapName = (key) => {
        switch (key) {
            case 'Orbiter':
                return orbiter?.name || 'Orbiter';
            case 'OrbiterMentor':
                return orbiter?.mentorName || 'Orbiter Mentor';
            case 'CosmoOrbiter':
                return cosmoOrbiter?.name || 'Cosmo Orbiter';
            case 'CosmoMentor':
                return cosmoOrbiter?.mentorName || 'Cosmo Mentor';
            case 'UJustBe':
                return 'UJustBe';
            default:
                return key || '';
        }
    };

    const paidToOrbiter = Number(referralData?.paidToOrbiter || 0);
    const paidToOrbiterMentor = Number(
        referralData?.paidToOrbiterMentor || 0
    );
    const paidToCosmoMentor = Number(
        referralData?.paidToCosmoMentor || 0
    );

    const ujbBalance = Number(referralData?.ujbBalance || 0);

    if (loading || !referralData) {
        return (
            <AdminLayout>
                <Text variant="h1">Loading referral…</Text>
            </AdminLayout>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {/* HEADER */}
                <div>
                    <Text variant="h1">
                        Referral #{referralData?.referralId}
                    </Text>
                    <Text variant="muted">
                        Source: {referralData?.referralSource || 'Referral'}
                    </Text>
                </div>

                {/* MAIN GRID */}
                <div className="grid grid-cols-12 gap-6">
                    {/* LEFT COLUMN */}
                    <div className="col-span-8 space-y-6">
                        <StatusSection
                            formState={formState}
                            setFormState={setFormState}
                            onUpdate={handleStatusUpdate}
                            statusLogs={referralData.statusLogs || []}
                        />

                        <ServiceDetailsSection
                            referralData={referralData}
                            dealLogs={dealLogs}
                            onSaveDealLog={handleSaveDealLog}
                        />

                        <ProfilesSection
                            orbiter={orbiter}
                            cosmoOrbiter={cosmoOrbiter}
                            referralData={referralData}
                        />

                        <PaymentHistorySection
                            payments={payments}
                            mapName={mapName}
                            onRequestPayout={(payload) => {
                                setPayoutRequest(payload);
                                setShowPaymentDrawer(true);
                            }}
                        />
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="col-span-4 space-y-6">
                        <FollowupSection
                            followups={followups}
                            onAdd={addFollowup}
                            onEdit={editFollowup}
                            onDelete={deleteFollowup}
                        />

                        <Card>
                            <PaymentSummaryBar
                                agreedAmount={payment.agreedAmount}
                                cosmoPaid={payment.cosmoPaid}
                                agreedRemaining={payment.agreedRemaining}
                                ujbBalance={ujbBalance}
                                paidTo={{
                                    orbiter: paidToOrbiter,
                                    orbiterMentor: paidToOrbiterMentor,
                                    cosmoMentor: paidToCosmoMentor,
                                }}
                                referralData={referralData}
                                onAddPayment={payment.openPaymentModal}
                            />
                        </Card>
                    </div>
                </div>

                {/* PAYMENT DRAWER */}
                <PaymentDrawer
                    isOpen={showPaymentDrawer}
                    onClose={() => setShowPaymentDrawer(false)}
                    payment={payment}
                    referralData={referralData}
                    ujbBalance={ujb.ujbBalance}
                    paidTo={{
                        orbiter: paidToOrbiter,
                        orbiterMentor: paidToOrbiterMentor,
                        cosmoMentor: paidToCosmoMentor,
                    }}
                    payments={payments}
                    mapName={mapName}
                    dealEverWon={dealEverWon}
                    onRequestPayout={(payload) => {
                        setPayoutModal({
                            open: true,
                            slot: payload.slotKey,
                            amount: payload.amount,
                            fromPaymentId: payload.fromPaymentId,
                            modeOfPayment: '',
                            transactionRef: '',
                            paymentDate: new Date().toISOString().split('T')[0],
                            processing: false,
                        });
                    }}
                />

                {payoutModal.open && (
                    <Modal
                        isOpen
                        onClose={() => setPayoutModal(p => ({ ...p, open: false }))}
                        title={`Payout — ${payoutModal.slot}`}
                    >
                        <Text>
                            Logical Amount: ₹{Number(payoutModal.amount).toLocaleString('en-IN')}
                        </Text>

                        <FormField label="Mode of Payment" required>
                            <Select
                                value={payoutModal.modeOfPayment}
                                onChange={(value) =>
                                    setPayoutModal(p => ({ ...p, modeOfPayment: value }))
                                }
                                options={[
                                    { label: 'Bank Transfer', value: 'Bank Transfer' },
                                    { label: 'GPay', value: 'GPay' },
                                    { label: 'Razorpay', value: 'Razorpay' },
                                    { label: 'Cash', value: 'Cash' },
                                ]}
                            />
                        </FormField>

                        <FormField label="Transaction Reference" required>
                            <Input
                                value={payoutModal.transactionRef}
                                onChange={(e) =>
                                    setPayoutModal(p => ({
                                        ...p,
                                        transactionRef: e.target.value,
                                    }))
                                }
                            />
                        </FormField>

                        <FormField label="Payment Date" required>
                            <DateInput
                                value={payoutModal.paymentDate}
                                onChange={(value) =>
                                    setPayoutModal(p => ({ ...p, paymentDate: value }))
                                }
                            />
                        </FormField>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                variant="secondary"
                                onClick={() => setPayoutModal(p => ({ ...p, open: false }))}
                                disabled={payoutModal.processing}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="primary"
                                disabled={payoutModal.processing}
                                onClick={async () => {
                                    if (!payoutModal.modeOfPayment || !payoutModal.transactionRef) return;

                                    setPayoutModal(p => ({ ...p, processing: true }));

                                    await ujb.payFromSlot({
                                        recipient: payoutModal.slot,
                                        amount: payoutModal.amount,
                                        logicalAmount: payoutModal.amount,
                                        tdsAmount: 0,
                                        fromPaymentId: payoutModal.fromPaymentId,
                                        modeOfPayment: payoutModal.modeOfPayment,
                                        transactionRef: payoutModal.transactionRef,
                                        paymentDate: payoutModal.paymentDate,
                                    });

                                    setPayoutModal(p => ({ ...p, open: false, processing: false }));
                                }}
                            >
                                {payoutModal.processing ? 'Processing…' : 'Confirm Payout'}
                            </Button>
                        </div>
                    </Modal>
                )}


                {payoutRequest && (
                    <Modal
                        isOpen={true}
                        onClose={() => setPayoutRequest(null)}
                        title="Confirm Payout"
                    >
                        <Text>
                            Slot: {payoutRequest.slotKey}
                        </Text>

                        <Text>
                            Amount: ₹{Number(payoutRequest.amount).toLocaleString('en-IN')}
                        </Text>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                variant="secondary"
                                onClick={() => setPayoutRequest(null)}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="primary"
                                onClick={async () => {
                                    await ujb.payFromSlot({
                                        recipient: payoutRequest.slotKey,
                                        amount: payoutRequest.amount,
                                        logicalAmount: payoutRequest.amount,
                                        tdsAmount: 0,
                                        fromPaymentId: payoutRequest.fromPaymentId,
                                        modeOfPayment: 'Bank Transfer',
                                        transactionRef: `AUTO-${Date.now()}`,
                                        paymentDate: new Date()
                                            .toISOString()
                                            .split('T')[0],
                                    });

                                    setPayoutRequest(null);
                                }}
                            >
                                Confirm Payout
                            </Button>
                        </div>
                    </Modal>
                )}

                {payment.showAddPaymentForm && (
                    <Modal
                        isOpen={payment.showAddPaymentForm}
                        onClose={payment.closePaymentModal}
                        title="Add Payment (Cosmo → UJB)"
                    >
                        <FormField label="Amount" required>
                            <Input
                                type="number"
                                value={payment.newPayment.amountReceived}
                                onChange={(e) =>
                                    payment.updateNewPayment('amountReceived', e.target.value)
                                }
                            />
                        </FormField>

                        <FormField label="Mode of Payment">
                            <Select
                                value={payment.newPayment.modeOfPayment}
                                onChange={(e) =>
                                    payment.updateNewPayment('modeOfPayment', e.target.value)
                                }
                                options={[
                                    { label: 'Bank Transfer', value: 'Bank Transfer' },
                                    { label: 'GPay', value: 'GPay' },
                                    { label: 'Razorpay', value: 'Razorpay' },
                                    { label: 'Cash', value: 'Cash' },
                                ]}
                            />
                        </FormField>

                        <FormField label="Transaction Ref">
                            <Input
                                value={payment.newPayment.transactionRef}
                                onChange={(e) =>
                                    payment.updateNewPayment('transactionRef', e.target.value)
                                }
                            />
                        </FormField>

                        <FormField label="Payment Date" required>
                            <DateInput
                                value={payment.newPayment.paymentDate}
                                onChange={(e) =>
                                    payment.updateNewPayment('paymentDate', e.target.value)
                                }
                            />
                        </FormField>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                variant="secondary"
                                onClick={payment.closePaymentModal}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="primary"
                                onClick={payment.handleSavePayment}
                            >
                                Save
                            </Button>
                        </div>
                    </Modal>
                )}


            </div>
        </>
    );
}
