'use client'

import { useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { useEffect, useState } from 'react'

import Combobox from './combobox'
import { Button } from '@/components/ui/button'
import Output from './output'

// the search only works if the values
// match the value, not the label (dumb)
const cities = [
  {
    value: 'campinas',
    label: 'Campinas'
  }
]

const patologies = [
  {
    value: 'covid-19',
    label: 'COVID-19'
  }
  // {
  //   value: 'fluxo cerebrino tropical',
  //   label: 'Fluxo Cerebrino Tropical'
  // }
]

const patologyActualValues = {
  'covid-19': 'covid'
  // 'fluxo cerebrino tropical': 'fct'
}

const formSchema = z.object({
  city: z.string().min(1),
  patology: z.string().min(1)
})

export default function ModelConfiguration() {
  const [configuration, setConfiguration] = useState({
    city: 'campinas',
    patology: 'covid-19'
  })
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: {
      city: 'campinas',
      patology: 'covid-19'
    }
  })

  const { isValid } = useFormState({ control: form.control })

  useEffect(() => {
    setSubmitted(true)
  }, [])

  function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitted(true)
    setConfiguration(values)
  }

  return (
    <div className="flex w-full flex-col gap-y-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full min-w-64 flex-col gap-y-4 md:w-96"
        >
          <div className="flex flex-col justify-between gap-x-4 gap-y-6 md:flex-row">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-y-1">
                  <FormLabel className="font-normal">Cidade</FormLabel>
                  <FormControl>
                    <Combobox
                      attributes={cities}
                      attributeName="cidade"
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      disabled={submitted}
                      className="w-full md:w-56"
                    />
                  </FormControl>
                  <FormMessage className="text-muted-foreground font-normal">
                    Atualmente, apenas a cidade de Campinas está disponível.
                  </FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="patology"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-y-1">
                  <FormLabel className="font-normal">Patologia</FormLabel>
                  <FormControl>
                    <Combobox
                      attributes={patologies}
                      attributeName="patologia"
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      disabled={submitted}
                      className="w-full md:w-56"
                    />
                  </FormControl>
                  <FormMessage className="text-muted-foreground font-normal">
                    {/* Fluxo Cerebino Tropical é uma patologia de teste. */}
                    Atualmente, apenas a patologia do COVID-19 está disponível.
                  </FormMessage>
                </FormItem>
              )}
            />
            <div className="flex h-full flex-col justify-center gap-y-3">
              <FormLabel className="hidden font-normal text-transparent md:flex">.</FormLabel>
              <Button
                disabled={!isValid || submitted}
                type="submit"
                className="bg-pandemica-blue/70 dark:bg-pandemica-blue/50 dark:hover:bg-pandemica-blue border-pandemica-blue hover:bg-pandemica-blue dark:text-primary flex h-9 w-24 flex-row gap-x-0.5 rounded-full border py-2 text-white"
              >
                Simular
              </Button>
            </div>
          </div>
        </form>
      </Form>
      {submitted && <Output configuration={configuration} />}
    </div>
  )
}
