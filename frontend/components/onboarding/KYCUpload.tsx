'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useUIStore } from '@/lib/stores/ui.store';

interface KYCFormData {
  documentType: string;
  documentNumber: string;
  documentFile: FileList;
}

export default function KYCUpload() {
  const { showNotification } = useUIStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<KYCFormData>();

  const onSubmit = async (data: KYCFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement KYC upload API call
      // For now, just show a notification
      showNotification({
        type: 'info',
        message: 'KYC upload functionality will be implemented with the KYC service integration.',
      });
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Failed to upload KYC documents',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-2">
          Document Type
        </label>
        <select
          {...register('documentType', { required: 'Document type is required' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Select document type</option>
          <option value="NATIONAL_ID">National ID</option>
          <option value="PASSPORT">Passport</option>
          <option value="DRIVERS_LICENSE">Driver's License</option>
        </select>
        {errors.documentType && (
          <p className="mt-1 text-sm text-red-600">{errors.documentType.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700 mb-2">
          Document Number
        </label>
        <Input
          {...register('documentNumber', { required: 'Document number is required' })}
          type="text"
          placeholder="Enter document number"
        />
        {errors.documentNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.documentNumber.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="documentFile" className="block text-sm font-medium text-gray-700 mb-2">
          Upload Document
        </label>
        <input
          {...register('documentFile', { required: 'Document file is required' })}
          type="file"
          accept="image/*,.pdf"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
        {errors.documentFile && (
          <p className="mt-1 text-sm text-red-600">{errors.documentFile.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Accepted formats: JPG, PNG, PDF (Max 5MB)
        </p>
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        fullWidth
      >
        {isSubmitting ? 'Uploading...' : 'Upload Document'}
      </Button>
    </form>
  );
}


