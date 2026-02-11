'use client';

import { useState } from 'react';

import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import ActionButton from '@/components/ui/ActionButton';
import FormField from '@/components/ui/FormField';
import Select from '@/components/ui/Select';
import DateInput from '@/components/ui/DateInput';
import Textarea from '@/components/ui/Textarea';

export default function FollowupSection({
  followups = [],
  onAdd,
  onEdit,
  onDelete,
}) {
  const defaultForm = {
    priority: 'Medium',
    date: '',
    description: '',
    status: 'Pending',
  };

  const [form, setForm] = useState(defaultForm);
  const [editingIndex, setEditingIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.date) e.date = 'Date is required';
    if (!form.description)
      e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      if (editingIndex !== null) {
        await onEdit(editingIndex, form);
      } else {
        await onAdd(form);
      }

      setForm(defaultForm);
      setEditingIndex(null);
      setErrors({});
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (i) => {
    setEditingIndex(i);
    setForm(followups[i]);
    setErrors({});
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setForm(defaultForm);
    setErrors({});
  };

  return (
    <div className="space-y-6">
      {/* LIST */}
      <Card>
        <Text variant="h3">Follow Ups</Text>

        <div className="space-y-4 mt-4">
          {followups?.length ? (
            followups.map((f, i) => (
              <Card key={i}>
                <div className="flex items-start justify-between">
                  <div>
                    <Text>
                      <strong>{f.priority}</strong> —{' '}
                      {f.status}
                    </Text>
                    <Text variant="muted">
                      {f.date}
                    </Text>
                    <Text>{f.description}</Text>
                  </div>

                  <div className="flex gap-2">
                    <ActionButton
                      icon="edit"
                      label="Edit follow-up"
                      variant="ghost"
                      onClick={() => handleEdit(i)}
                    />

                    <ActionButton
                      icon="trash"
                      label="Delete follow-up"
                      variant="ghostDanger"
                      onClick={() => onDelete(i)}
                    />
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Text variant="muted">
              No follow-ups yet.
            </Text>
          )}
        </div>
      </Card>

      {/* FORM */}
      <Card>
        <Text variant="h3">
          {editingIndex !== null
            ? 'Edit Follow Up'
            : 'Add Follow Up'}
        </Text>

        <FormField label="Priority">
          <Select
            value={form.priority}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                priority: e.target.value,
              }))
            }
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </Select>
        </FormField>

        <FormField
          label="Next Date"
          error={errors.date}
          required
        >
          <DateInput
            value={form.date}
            error={!!errors.date}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                date: e.target.value,
              }))
            }
          />
        </FormField>

        <FormField
          label="Description"
          error={errors.description}
          required
        >
          <Textarea
            value={form.description}
            error={!!errors.description}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                description: e.target.value,
              }))
            }
          />
        </FormField>

        <FormField label="Status">
          <Select
            value={form.status}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                status: e.target.value,
              }))
            }
          >
            <option>Pending</option>
            <option>Completed</option>
          </Select>
        </FormField>

        <div className="flex gap-2 mt-4">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? 'Saving…'
              : editingIndex !== null
              ? 'Update Follow Up'
              : 'Save Follow Up'}
          </Button>

          {editingIndex !== null && (
            <Button
              variant="ghost"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
