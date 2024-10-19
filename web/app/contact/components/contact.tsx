'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFormState } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import Layout from '@/components/layout'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

const formSchema = z.object({
  firstName: z
    .string()
    .min(2, {
      message: 'First name must be at least 2 characters long'
    })
    .max(100, {
      message: 'First name must be at most 100 characters long'
    }),
  lastName: z
    .string()
    .min(2, {
      message: 'Last name must be at least 2 characters long'
    })
    .max(100, {
      message: 'Last name must be at most 100 characters long'
    }),
  message: z
    .string()
    .min(10, {
      message: 'Message must be at least 10 characters long'
    })
    .max(1000, {
      message: 'Message must be at most 1000 characters long'
    })
})

export default function Contact() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      message: ''
    }
  })

  const { isValid } = useFormState({ control: form.control })

  function onSubmit(values: z.infer<typeof formSchema>) {
    window.open(
      `mailto:joaopedroferreirabarbosa6@gmail.com?subject=Contact About Pandemica&body=Hi! My name is ${values.firstName} ${values.lastName} and ${values.message}`
    )
  }

  return (
    <Layout className="justify-start">
      <div className="flex h-full w-full items-center justify-center py-20">
        <main className="flex w-full flex-col gap-y-4 px-8 md:w-auto md:max-w-4xl pb-32">
          <h4 className="font-sans-heading from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-lg font-semibold tracking-tighter text-transparent sm:text-xl xl:text-2xl/none">
            Contact us
          </h4>
          <div className="flex flex-col gap-y-4 md:flex-row md:justify-evenly md:gap-x-10">
            <div className="flex flex-col space-y-4">
              <div className="w-full min-w-64 space-y-2 md:w-96">
                <p className="text-muted-foreground text-sm">
                  Fill out the form below and we will get back to you as soon as possible.
                </p>
              </div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex w-full min-w-64 flex-col gap-y-4 md:w-96"
                >
                  <div className="flex flex-col justify-between gap-y-4 md:flex-row">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-normal">First name</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              className="h-9 w-full md:w-44"
                              placeholder="John"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="font-normal" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-normal">Last name</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              className="h-9 w-full md:w-44"
                              placeholder="Doe"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="font-normal" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-normal">Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Hi, I would like to know more about..."
                            {...field}
                          ></Textarea>
                        </FormControl>
                        <FormMessage className="font-normal" />
                      </FormItem>
                    )}
                  />
                  <Button
                    disabled={!isValid}
                    type="submit"
                    className="bg-pandemica-blue/70 dark:bg-pandemica-blue/50 dark:hover:bg-pandemica-blue border-pandemica-blue hover:bg-pandemica-blue dark:text-primary flex h-9 w-24 flex-row gap-x-0.5 rounded-full border text-white"
                  >
                    Send
                  </Button>
                </form>
              </Form>
            </div>
            <div className="flex flex-col space-y-4 pt-10 md:pt-0">
              <div className="w-full min-w-64 space-y-4 md:w-96">
                <p className="text-muted-foreground text-sm">
                  If you have specific questions, please refer to one of the emails below.
                </p>
                <ul className="space-y-6 md:space-y-10">
                  <li>
                    <p className="text-sm">Legal</p>
                    <Link
                      href="mailto:legal@pandemica.com.br"
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200"
                    >
                      legal@pandemica.com.br
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  )
}
