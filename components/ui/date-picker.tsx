'use client'

import * as React from 'react'
import { format, parse, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

// value and onChange use 'yyyy-MM-dd'
export function DatePicker({
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
  required,
  disabled,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const parsed = value ? parse(value, 'yyyy-MM-dd', new Date()) : null
  const selectedDate = parsed && isValid(parsed) ? parsed : undefined

  const displayLabel = selectedDate
    ? format(selectedDate, 'dd/MM/yyyy', { locale: es })
    : null

  function handleDaySelect(date: Date | undefined) {
    if (!date) return
    onChange(format(date, 'yyyy-MM-dd'))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !displayLabel && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {displayLabel ?? placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDaySelect}
          initialFocus
          locale={es}
          captionLayout="dropdown"
          startMonth={new Date(1940, 0)}
          endMonth={new Date()}
        />
      </PopoverContent>
    </Popover>
  )
}
