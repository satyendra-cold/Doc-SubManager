import React, { useState, useEffect } from 'react';
import useDataStore, { SubscriptionItem } from '../../store/dataStore';
import { toast } from 'react-hot-toast';
import { X, Save, Loader2 } from 'lucide-react';
import { submitToGoogleSheets } from '../../utils/googleSheetsService';

interface EditSubscriptionProps {
    isOpen: boolean;
    onClose: () => void;
    subscriptionId: string | null;
}

const EditSubscription: React.FC<EditSubscriptionProps> = ({ isOpen, onClose, subscriptionId }) => {
    const { subscriptions, updateSubscription } = useDataStore();

    const [formData, setFormData] = useState<Partial<SubscriptionItem>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && subscriptionId) {
            const sub = subscriptions.find(s => s.id === subscriptionId);
            if (sub) {
                setFormData({ ...sub });
            }
        }
    }, [isOpen, subscriptionId, subscriptions]);

    if (!isOpen || !subscriptionId) return null;

    const handleChange = (field: keyof SubscriptionItem, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.companyName || !formData.subscriptionName || !formData.subscriberName) {
            toast.error("Please fill all required fields.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare complete row data matching the Subscription sheet columns
            // Columns: A(Timestamp), B(Serial No), C(Company Name), D(Subscriber Name), E(Subscription Name),
            // F(Price), G(Frequency), H(Purpose), I(Planned1), J(Actual1), K(Renewal Status), L(Renewal Count),
            // M(Planned2), N(Actual2), O(Approval Status), P(Approval Date), Q(Actual3/Payment), R(Transaction ID),
            // S(Payment File), T(Start Date), U(End Date), V(Payment Receipt)
            const sheetRow = [
                formData.requestedDate || new Date().toLocaleDateString("en-GB"), // A: Timestamp/Requested Date
                formData.sn || '', // B: Serial No
                formData.companyName, // C: Company Name
                formData.subscriberName, // D: Subscriber Name
                formData.subscriptionName, // E: Subscription Name
                formData.price || '', // F: Price
                formData.frequency || '', // G: Frequency
                formData.purpose || '', // H: Purpose
                '', // I: Planned1 (leave as is)
                '', // J: Actual1 (leave as is)
                formData.renewalStatus || '', // K: Renewal Status
                formData.renewalCount || '0', // L: Renewal Count
                '', // M: Planned2 (leave as is)
                formData.actual2 || '', // N: Actual2 (Approved On)
                formData.status === 'Approved' ? 'Approved' : formData.status === 'Rejected' ? 'Rejected' : '', // O: Approval Status
                formData.approvalDate || '', // P: Approval Date
                formData.actual3 || '', // Q: Actual3 (Payment)
                formData.transactionId || '', // R: Transaction ID
                formData.paymentFile || '', // S: Payment File
                formData.startDate || '', // T: Start Date
                formData.endDate || '', // U: End Date
                '' // V: Payment Receipt
            ];

            // Submit update to Google Sheets using rowIndex
            if (formData.rowIndex) {
                await submitToGoogleSheets({
                    action: "update",
                    sheetName: "Subscription",
                    data: sheetRow,
                    rowIndex: formData.rowIndex
                });
            } else if (formData.sn) {
                // Fallback: Update by Serial Number using updateCellsBySn action
                const cellUpdates = [
                    { column: 1, value: formData.requestedDate || new Date().toLocaleDateString("en-GB") },
                    { column: 3, value: formData.companyName },
                    { column: 4, value: formData.subscriberName },
                    { column: 5, value: formData.subscriptionName },
                    { column: 6, value: formData.price || '' },
                    { column: 7, value: formData.frequency || '' },
                    { column: 8, value: formData.purpose || '' },
                    { column: 11, value: formData.renewalStatus || '' },
                    { column: 12, value: formData.renewalCount || '0' },
                    { column: 14, value: formData.actual2 || '' },
                    { column: 15, value: formData.status === 'Approved' ? 'Approved' : formData.status === 'Rejected' ? 'Rejected' : '' },
                    { column: 16, value: formData.approvalDate || '' },
                    { column: 17, value: formData.actual3 || '' },
                    { column: 18, value: formData.transactionId || '' },
                    { column: 19, value: formData.paymentFile || '' },
                    { column: 20, value: formData.startDate || '' },
                    { column: 21, value: formData.endDate || '' }
                ];

                await submitToGoogleSheets({
                    action: "updateCellsBySn",
                    sheetName: "Subscription",
                    sn: formData.sn,
                    cellUpdates: cellUpdates
                });
            }

            // Update local state
            updateSubscription(subscriptionId, formData);

            toast.success("Subscription updated successfully");
            onClose();

        } catch (error) {
            console.error("Update failed:", error);
            toast.error("Failed to update subscription");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/40 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl my-4">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Edit Subscription</h2>
                        {formData.sn && <p className="text-xs text-gray-500 font-mono">{formData.sn}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 max-h-[75vh] overflow-y-auto bg-gray-50/30">
                    <form id="edit-sub-form" onSubmit={handleSubmit} className="space-y-3">
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                                {/* 1. Serial No (Read-only) */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Serial No</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 text-xs border border-gray-200 rounded-lg bg-gray-100 text-gray-500 font-mono cursor-not-allowed"
                                        value={formData.sn || ''}
                                        readOnly
                                    />
                                </div>

                                {/* 2. Requested Date */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Requested Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none font-medium bg-gray-50/50 focus:bg-white transition-colors"
                                        value={formData.requestedDate ? new Date(formData.requestedDate).toISOString().split('T')[0] : ''}
                                        onChange={e => handleChange('requestedDate', e.target.value)}
                                    />
                                </div>

                                {/* 3. Company Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Company Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none font-medium bg-gray-50/50 focus:bg-white transition-colors"
                                        value={formData.companyName || ''}
                                        onChange={e => handleChange('companyName', e.target.value)}
                                        placeholder="Enter company name..."
                                    />
                                </div>

                                {/* 4. Subscriber Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Subscriber Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none font-medium bg-gray-50/50 focus:bg-white transition-colors"
                                        value={formData.subscriberName || ''}
                                        onChange={e => handleChange('subscriberName', e.target.value)}
                                        placeholder="Enter subscriber name..."
                                    />
                                </div>

                                {/* 5. Subscription Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Subscription Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none font-medium bg-gray-50/50 focus:bg-white transition-colors"
                                        value={formData.subscriptionName || ''}
                                        onChange={e => handleChange('subscriptionName', e.target.value)}
                                        placeholder="Enter subscription name..."
                                    />
                                </div>

                                {/* 6. Price */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Price</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none font-medium bg-gray-50/50 focus:bg-white transition-colors"
                                        value={formData.price || ''}
                                        onChange={e => handleChange('price', e.target.value)}
                                        placeholder="Enter price..."
                                    />
                                </div>

                                {/* 7. Frequency */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Frequency</label>
                                    <select
                                        className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none font-medium bg-gray-50/50 focus:bg-white transition-colors"
                                        value={formData.frequency || ''}
                                        onChange={e => handleChange('frequency', e.target.value)}
                                    >
                                        <option value="">Select Frequency</option>
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                        <option value="Quarterly">Quarterly</option>
                                        <option value="Yearly">Yearly</option>
                                        <option value="One-time">One-time</option>
                                    </select>
                                </div>

                                {/* 8. Purpose */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Purpose</label>
                                    <textarea
                                        className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none font-medium bg-gray-50/50 focus:bg-white transition-colors resize-none"
                                        rows={3}
                                        value={formData.purpose || ''}
                                        onChange={e => handleChange('purpose', e.target.value)}
                                        placeholder="Enter purpose..."
                                    />
                                </div>

                                {/* 9. Status */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                                    <select
                                        className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none font-medium bg-gray-50/50 focus:bg-white transition-colors"
                                        value={formData.status || 'Pending'}
                                        onChange={e => handleChange('status', e.target.value)}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>

                                {/* 10. Start Date */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none font-medium bg-gray-50/50 focus:bg-white transition-colors"
                                        value={formData.startDate || ''}
                                        onChange={e => handleChange('startDate', e.target.value)}
                                    />
                                </div>

                                {/* 11. End Date */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none font-medium bg-gray-50/50 focus:bg-white transition-colors"
                                        value={formData.endDate || ''}
                                        onChange={e => handleChange('endDate', e.target.value)}
                                    />
                                </div>

                            </div>
                        </div>
                    </form>
                </div>

                <div className="flex gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2 px-3 rounded-lg border border-gray-200 text-gray-700 text-sm font-bold hover:bg-white hover:border-gray-300 transition-all shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="edit-sub-form"
                        disabled={isSubmitting}
                        className={`flex-[2] flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-white text-sm font-bold transition-all shadow-md shadow-indigo-100 ${isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {isSubmitting ? 'Updating...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditSubscription;
