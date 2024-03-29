import { useState } from 'react'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type ComboboxProps = {
  attributeName: string
  attributes: {
    value: string
    label: string
  }[]
  onChange: (value: string) => void
  value: string
  disabled?: boolean
  className?: string
}

export default function Combobox({
  attributeName,
  attributes,
  onChange,
  value,
  disabled = false,
  className = ''
}: ComboboxProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-[200px] justify-between', className)}
        >
          {value
            ? attributes.find((attribute) => attribute.value === value)?.label
            : attributeName[0].toUpperCase() + attributeName.substring(1)}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('w-[200px] p-0', className)}>
        <Command>
          <CommandInput
            placeholder={`Pesquisar ${attributeName.toLowerCase()}...`}
            className="h-9"
          />
          <CommandEmpty />
          <CommandGroup>
            {attributes.map((attribute) => (
              <CommandItem
                key={attribute.value}
                value={attribute.value}
                onSelect={() => handleSelect(attribute.value)}
              >
                {attribute.label}
                <CheckIcon
                  className={cn(
                    'ml-auto h-4 w-4',
                    value === attribute.value ? 'opacity-100' : 'opacity-0'
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
