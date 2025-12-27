'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';

export interface SecuritiesOption {
  id: string;
  type: 'EQUITY' | 'DEBT' | 'GUARANTEE';
  subtype?: string;
  label: string;
  description: string;
  icon: string;
  href?: string;
}

export interface SelectedSecuritiesOption extends SecuritiesOption {
  amount?: number; // Optional for GUARANTEE type
}

interface SecuritiesExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (options: SelectedSecuritiesOption[]) => void;
  projectId: string;
  totalAmount?: number;
  minInvestment?: number;
  maxInvestment?: number;
}

const securitiesOptions: SecuritiesOption[] = [
  {
    id: 'equity-ordinary',
    type: 'EQUITY',
    subtype: 'ORDINARY_SHARES',
    label: 'Ordinary Shares',
    description: 'Purchase using ordinary shares as consideration. Get equity ownership in the project.',
    icon: '📈',
    href: '/securities/equity/ordinary-shares',
  },
  {
    id: 'equity-preference',
    type: 'EQUITY',
    subtype: 'PREFERENCE_SHARES',
    label: 'Preference Shares',
    description: 'Purchase using preference shares with priority dividends and liquidation preference.',
    icon: '⭐',
    href: '/securities/equity/preference-shares',
  },
  {
    id: 'debt-bonds',
    type: 'DEBT',
    subtype: 'BONDS',
    label: 'Bonds',
    description: 'Purchase using bonds as consideration. Secured by guarantees for risk mitigation.',
    icon: '💼',
    href: '/securities/debt/bonds',
  },
  {
    id: 'debt-loans',
    type: 'DEBT',
    subtype: 'LOANS',
    label: 'Loans',
    description: 'Purchase using loans as consideration. Flexible repayment terms with guarantee backing.',
    icon: '💰',
    href: '/securities/debt/loans',
  },
  {
    id: 'guarantee',
    type: 'GUARANTEE',
    label: 'Guarantee-Backed',
    description: 'Purchase with guarantee protection. Reduce risk with third-party guarantees.',
    icon: '🛡️',
    href: '/securities/guarantees',
  },
];

export default function SecuritiesExchangeModal({
  isOpen,
  onClose,
  onSelect,
  projectId,
  totalAmount = 0,
  minInvestment = 0,
  maxInvestment,
}: SecuritiesExchangeModalProps) {
  const [selectedOptions, setSelectedOptions] = useState<Map<string, SelectedSecuritiesOption>>(new Map());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleToggleOption = (option: SecuritiesOption) => {
    const newSelected = new Map(selectedOptions);
    
    if (newSelected.has(option.id)) {
      // Remove if already selected
      newSelected.delete(option.id);
    } else {
      // Add with initial amount of 0
      newSelected.set(option.id, {
        ...option,
        amount: 0,
      });
    }
    
    setSelectedOptions(newSelected);
  };

  const handleAmountChange = (optionId: string, amount: number) => {
    const newSelected = new Map(selectedOptions);
    const option = newSelected.get(optionId);
    
    if (option) {
      newSelected.set(optionId, {
        ...option,
        amount: Math.max(0, amount),
      });
      setSelectedOptions(newSelected);
    }
  };

  const calculateTotal = () => {
    // Only sum amounts for non-guarantee options
    return Array.from(selectedOptions.values()).reduce((sum, opt) => {
      if (opt.type === 'GUARANTEE') return sum;
      return sum + (opt.amount || 0);
    }, 0);
  };

  const getTotalAmount = () => {
    return totalAmount || calculateTotal();
  };

  const canContinue = () => {
    if (selectedOptions.size === 0) return false;
    
    const total = calculateTotal();
    if (totalAmount > 0) {
      // If totalAmount is provided, amounts should sum to it (excluding guarantee options)
      return Math.abs(total - totalAmount) < 0.01;
    }
    
    // Otherwise, check that all non-guarantee selected options have amounts > 0
    return Array.from(selectedOptions.values()).every(opt => {
      if (opt.type === 'GUARANTEE') return true; // Guarantee doesn't need amount
      return (opt.amount || 0) > 0;
    });
  };

  const handleContinue = () => {
    if (canContinue()) {
      const options = Array.from(selectedOptions.values());
      onSelect(options);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedOptions(new Map());
    onClose();
  };

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedOptions(new Map());
    }
  }, [isOpen]);

  const selectedCount = selectedOptions.size;
  const total = calculateTotal();
  const remaining = totalAmount > 0 ? totalAmount - total : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Choose Securities Exchange Options"
      size="xl"
    >
      <div className="space-y-6">
        <div>
          <p className="text-gray-600 mb-2">
            Select one or more securities options for your investment. You can allocate different amounts to each option.
          </p>
          {totalAmount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Total Investment Amount:</span> {formatCurrency(totalAmount)}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Allocate this amount across your selected options
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto scrollbar-hide pr-2">
          {securitiesOptions.map((option) => {
            const isSelected = selectedOptions.has(option.id);
            const selectedOption = selectedOptions.get(option.id);
            
            return (
              <Card
                key={option.id}
                className={`transition-all ${
                  isSelected
                    ? 'ring-2 ring-primary-600 border-primary-600 bg-primary-50'
                    : 'hover:shadow-md hover:border-primary-300'
                }`}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Option Header */}
                    <div
                      className="flex items-start gap-4 cursor-pointer"
                      onClick={() => handleToggleOption(option)}
                    >
                      <div className="text-4xl flex-shrink-0">{option.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{option.label}</h3>
                          {isSelected && (
                            <Badge variant="success" size="sm">
                              Selected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                        <Badge variant="outline" size="sm">
                          {option.type}
                        </Badge>
                      </div>
                      <div className="flex-shrink-0">
                        <div
                          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-primary-600 bg-primary-600'
                              : 'border-gray-300 bg-white hover:border-primary-400'
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Amount Input (shown when selected, but not for GUARANTEE) */}
                    {isSelected && option.type !== 'GUARANTEE' && (
                      <div className="pt-3 border-t border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount for {option.label} (KES)
                        </label>
                        <Input
                          type="number"
                          value={selectedOption?.amount || 0}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            handleAmountChange(option.id, value);
                          }}
                          min={0}
                          step="1000"
                          placeholder="Enter amount"
                          className="w-full"
                        />
                        {selectedOption && selectedOption.amount && selectedOption.amount > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {formatCurrency(selectedOption.amount)}
                          </p>
                        )}
                      </div>
                    )}
                    {isSelected && option.type === 'GUARANTEE' && (
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 italic">
                          No amount required for guarantee-backed investments
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary */}
        {selectedCount > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Selected Options:</span>
              <span className="text-sm font-semibold text-gray-900">{selectedCount}</span>
            </div>
            {Array.from(selectedOptions.values()).some(opt => opt.type === 'GUARANTEE') && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>🛡️</span>
                <span>Guarantee option selected (no amount required)</span>
              </div>
            )}
            {Array.from(selectedOptions.values()).some(opt => opt.type !== 'GUARANTEE') && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total Allocated:</span>
                  <span className="text-sm font-semibold text-primary-600">{formatCurrency(total)}</span>
                </div>
                {totalAmount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Remaining:</span>
                    <span className={`text-sm font-semibold ${
                      remaining && remaining > 0 ? 'text-orange-600' : 
                      remaining && remaining < 0 ? 'text-red-600' : 
                      'text-green-600'
                    }`}>
                      {remaining !== null ? formatCurrency(remaining) : 'N/A'}
                    </span>
                  </div>
                )}
                {totalAmount > 0 && remaining !== null && remaining !== 0 && (
                  <p className={`text-xs mt-2 ${
                    remaining > 0 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {remaining > 0 
                      ? `Please allocate ${formatCurrency(remaining)} more`
                      : `You have allocated ${formatCurrency(Math.abs(remaining))} more than the total amount`
                    }
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={!canContinue()}
          >
            Continue with {selectedCount > 0 ? `${selectedCount} option${selectedCount > 1 ? 's' : ''}` : 'Selection'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
