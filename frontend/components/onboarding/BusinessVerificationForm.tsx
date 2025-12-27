'use client';

import { useForm } from 'react-hook-form';
import { BusinessVerificationInput } from '@/lib/api/onboarding';
import { useSubmitBusinessVerification } from '@/lib/queries';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function BusinessVerificationForm() {
  const submitVerification = useSubmitBusinessVerification();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessVerificationInput>();

  const onSubmit = (data: BusinessVerificationInput) => {
    submitVerification.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
          Company Name
        </label>
        <Input
          {...register('companyName', { required: 'Company name is required' })}
          type="text"
          placeholder="Enter company name"
        />
        {errors.companyName && (
          <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-2">
          Registration Number
        </label>
        <Input
          {...register('registrationNumber', { required: 'Registration number is required' })}
          type="text"
          placeholder="Enter registration number"
        />
        {errors.registrationNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.registrationNumber.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="legalStructure" className="block text-sm font-medium text-gray-700 mb-2">
          Legal Structure
        </label>
        <select
          {...register('legalStructure', { required: 'Legal structure is required' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Select legal structure</option>
          <option value="LLC">LLC</option>
          <option value="CORPORATION">Corporation</option>
          <option value="PARTNERSHIP">Partnership</option>
          <option value="SOLE_PROPRIETORSHIP">Sole Proprietorship</option>
          <option value="COOPERATIVE">Cooperative</option>
        </select>
        {errors.legalStructure && (
          <p className="mt-1 text-sm text-red-600">{errors.legalStructure.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="registrationDate" className="block text-sm font-medium text-gray-700 mb-2">
          Registration Date (Optional)
        </label>
        <Input
          {...register('registrationDate')}
          type="date"
        />
      </div>

      <div>
        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
          Expiry Date (Optional)
        </label>
        <Input
          {...register('expiryDate')}
          type="date"
        />
      </div>

      <div>
        <label htmlFor="documentUrl" className="block text-sm font-medium text-gray-700 mb-2">
          Document URL (Optional)
        </label>
        <Input
          {...register('documentUrl')}
          type="url"
          placeholder="https://example.com/document.pdf"
        />
        <p className="mt-1 text-xs text-gray-500">
          Link to business registration document
        </p>
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={submitVerification.isPending}
        fullWidth
      >
        {submitVerification.isPending ? 'Submitting...' : 'Submit Verification'}
      </Button>
    </form>
  );
}


