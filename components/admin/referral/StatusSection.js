'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import FormField from '@/components/ui/FormField';
import Select from '@/components/ui/Select';

export default function StatusSection({
    formState,
    setFormState,
    onUpdate,
    statusLogs = [],
}) {
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!onUpdate) return;
        setSaving(true);
        try {
            await onUpdate(formState.dealStatus);
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (ts) => {
        if (!ts) return '';
        if (ts?.seconds) {
            return new Date(ts.seconds * 1000).toLocaleString();
        }
        return new Date(ts).toLocaleString();
    };

    const mapDealStatusToBadge = (status) => {
        switch (status) {
            case 'Deal Won':
            case 'Work Completed':
            case 'Received Full and Final Payment':
                return 'success';

            case 'Discussion in Progress':
            case 'Work in Progress':
                return 'info';

            case 'Not Connected':
            case 'Called but Not Answered':
                return 'warning';

            case 'Reject':
            case 'Deal Lost':
                return 'danger';

            case 'Hold':
                return 'neutral';

            default:
                return 'neutral';
        }
    };


    return (
        <Card>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Text variant="h3">Referral Status</Text>
                    <StatusBadge status={formState.dealStatus || 'Pending'} />
                </div>

                <FormField label="Deal Status">
                    <Select
                        value={formState.dealStatus}
                        onChange={(value) =>
                            setFormState(prev => ({
                                ...prev,
                                dealStatus: value
                            }))
                        }
                        options={[
                            { label: 'Pending', value: 'Pending' },
                            { label: 'Reject', value: 'Reject' },
                            { label: 'Not Connected', value: 'Not Connected' },
                            { label: 'Discussion in Progress', value: 'Discussion in Progress' },
                            { label: 'Hold', value: 'Hold' },
                            { label: 'Deal Won', value: 'Deal Won' },
                            { label: 'Deal Lost', value: 'Deal Lost' },
                            { label: 'Work in Progress', value: 'Work in Progress' },
                            { label: 'Work Completed', value: 'Work Completed' },
                            { label: 'Received Part Payment and Transferred to UJustBe', value: 'Received Part Payment and Transferred to UJustBe' },
                            { label: 'Received Full and Final Payment', value: 'Received Full and Final Payment' },
                            { label: 'Agreed % Transferred to UJustBe', value: 'Agreed % Transferred to UJustBe' },
                        ]}
                    />
                </FormField>

                <div>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving…' : 'Update Status'}
                    </Button>
                </div>

                {statusLogs?.length > 0 && (
                    <div className="space-y-3">
                        <Text variant="h3">Status History</Text>

                        <div className="space-y-2">
                            {statusLogs.map((log, i) => (
                                <Card key={i}>
                                    <div className="flex items-center justify-between">
                                        <StatusBadge status={mapDealStatusToBadge(formState.dealStatus)} />
                                        <Text variant="muted">
                                            {formatDate(log.updatedAt)}
                                        </Text>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
