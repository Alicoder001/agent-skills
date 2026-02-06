# Legacy Detailed Guide

This file preserves the previous detailed version of `SKILL.md` for deep reference.


# React Form Patterns

> React Hook Form + Zod for type-safe, performant forms.

## Instructions

### 1. Basic Setup

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    await loginUser(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input
          {...register('email')}
          type="email"
          placeholder="Email"
        />
        {errors.email && <span>{errors.email.message}</span>}
      </div>
      
      <div>
        <input
          {...register('password')}
          type="password"
          placeholder="Password"
        />
        {errors.password && <span>{errors.password.message}</span>}
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
}
```

### 2. With shadcn/ui Form Components

```tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
});

export function ProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="johndoe" {...field} />
              </FormControl>
              <FormDescription>
                Your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### 3. Multi-Step Form

```tsx
const stepSchemas = {
  personal: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
  }),
  contact: z.object({
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  preferences: z.object({
    newsletter: z.boolean(),
    notifications: z.enum(['all', 'important', 'none']),
  }),
};

type FormData = z.infer<typeof stepSchemas.personal> &
  z.infer<typeof stepSchemas.contact> &
  z.infer<typeof stepSchemas.preferences>;

function MultiStepForm() {
  const [step, setStep] = useState<'personal' | 'contact' | 'preferences'>('personal');
  const [formData, setFormData] = useState<Partial<FormData>>({});

  const currentSchema = stepSchemas[step];

  const form = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: formData,
  });

  const onStepSubmit = (data: Partial<FormData>) => {
    const newData = { ...formData, ...data };
    setFormData(newData);

    if (step === 'personal') setStep('contact');
    else if (step === 'contact') setStep('preferences');
    else submitFinalForm(newData as FormData);
  };

  const goBack = () => {
    if (step === 'contact') setStep('personal');
    else if (step === 'preferences') setStep('contact');
  };

  return (
    <div>
      <StepIndicator current={step} />
      
      <form onSubmit={form.handleSubmit(onStepSubmit)}>
        {step === 'personal' && <PersonalFields form={form} />}
        {step === 'contact' && <ContactFields form={form} />}
        {step === 'preferences' && <PreferencesFields form={form} />}
        
        <div className="flex gap-4">
          {step !== 'personal' && (
            <Button type="button" variant="outline" onClick={goBack}>
              Back
            </Button>
          )}
          <Button type="submit">
            {step === 'preferences' ? 'Submit' : 'Next'}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

### 4. Dynamic Fields (Array)

```tsx
import { useFieldArray } from 'react-hook-form';

const formSchema = z.object({
  name: z.string().min(2),
  emails: z.array(z.object({
    value: z.string().email(),
    type: z.enum(['personal', 'work']),
  })).min(1, 'At least one email required'),
});

function DynamicForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      emails: [{ value: '', type: 'personal' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'emails',
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register('name')} placeholder="Name" />
      
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2">
          <Input
            {...form.register(`emails.${index}.value`)}
            placeholder="Email"
          />
          <Select {...form.register(`emails.${index}.type`)}>
            <option value="personal">Personal</option>
            <option value="work">Work</option>
          </Select>
          {fields.length > 1 && (
            <Button type="button" onClick={() => remove(index)}>
              Remove
            </Button>
          )}
        </div>
      ))}
      
      <Button
        type="button"
        onClick={() => append({ value: '', type: 'personal' })}
      >
        Add Email
      </Button>
      
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### 5. File Upload

```tsx
const fileSchema = z.object({
  avatar: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, 'File is required')
    .refine(
      (files) => files[0]?.size <= 5 * 1024 * 1024,
      'Max file size is 5MB'
    )
    .refine(
      (files) => ['image/jpeg', 'image/png'].includes(files[0]?.type),
      'Only JPEG and PNG are allowed'
    ),
});

function FileUploadForm() {
  const form = useForm<z.infer<typeof fileSchema>>({
    resolver: zodResolver(fileSchema),
  });

  const onSubmit = async (data: z.infer<typeof fileSchema>) => {
    const formData = new FormData();
    formData.append('avatar', data.avatar[0]);
    await uploadFile(formData);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input
        type="file"
        accept="image/jpeg,image/png"
        {...form.register('avatar')}
      />
      {form.formState.errors.avatar && (
        <span>{form.formState.errors.avatar.message}</span>
      )}
      <Button type="submit">Upload</Button>
    </form>
  );
}
```

### 6. Async Validation

```tsx
const usernameSchema = z.object({
  username: z.string()
    .min(3)
    .refine(async (username) => {
      const response = await fetch(`/api/check-username?username=${username}`);
      const { available } = await response.json();
      return available;
    }, 'Username is already taken'),
});

function UsernameForm() {
  const form = useForm<z.infer<typeof usernameSchema>>({
    resolver: zodResolver(usernameSchema),
    mode: 'onBlur', // Validate on blur for async
  });
}
```

### 7. Form with Server Action (Next.js)

```tsx
// actions.ts
'use server';

import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  message: z.string().min(10),
});

export async function submitContactForm(formData: FormData) {
  const result = schema.safeParse({
    email: formData.get('email'),
    message: formData.get('message'),
  });

  if (!result.success) {
    return { error: result.error.flatten() };
  }

  await saveToDatabase(result.data);
  return { success: true };
}

// Component
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { submitContactForm } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Sending...' : 'Send'}
    </Button>
  );
}

export function ContactForm() {
  const [state, formAction] = useFormState(submitContactForm, null);

  return (
    <form action={formAction}>
      <Input name="email" type="email" />
      <Textarea name="message" />
      <SubmitButton />
      {state?.error && <p>Error: {JSON.stringify(state.error)}</p>}
      {state?.success && <p>Message sent!</p>}
    </form>
  );
}
```

## Best Practices

| Do | Don't |
|----|-------|
| âœ… Use Zod for validation | âŒ Manual validation |
| âœ… Show errors inline | âŒ Alert on submit |
| âœ… Disable button while submitting | âŒ Allow double submit |
| âœ… Use `mode: 'onBlur'` for UX | âŒ Validate on every keystroke |

## References

- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [shadcn/ui Form](https://ui.shadcn.com/docs/components/form)



