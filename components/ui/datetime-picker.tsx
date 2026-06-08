'use client'

import * as React from 'react'
import { format, parse, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))

const selectClass =
  'h-9 w-20 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 cursor-pointer'

interface DateTimePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

// value and onChange use 'yyyy-MM-ddTHH:mm' — same format as datetime-local
export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Seleccionar fecha y hora',
  required,
  disabled,
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)

  const parsed = value ? parse(value, "yyyy-MM-dd'T'HH:mm", new Date()) : null
  const selectedDate = parsed && isValid(parsed) ? parsed : undefined

  const selectedHour = selectedDate ? format(selectedDate, 'HH') : '00'
  const selectedMinute = selectedDate ? format(selectedDate, 'mm') : '00'

  const currentYear = new Date().getFullYear()

  const displayLabel = selectedDate
    ? format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: es })
    : null

  function emitChange(date: Date | undefined, hh: string, mm: string) {
    if (!date) return
    onChange(`${format(date, 'yyyy-MM-dd')}T${hh}:${mm}`)
  }

  function handleDaySelect(date: Date | undefined) {
    emitChange(date, selectedHour, selectedMinute)
    setOpen(false)
  }

  function handleHourChange(hh: string) {
    emitChange(selectedDate, hh, selectedMinute)
  }

  function handleMinuteChange(mm: string) {
    emitChange(selectedDate, selectedHour, mm)
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'flex-1 justify-start text-left font-normal',
              !displayLabel && 'text-muted-foreground',
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
            startMonth={new Date(currentYear - 1, 0)}
            endMonth={new Date(currentYear + 5, 11)}
          />
        </PopoverContent>
      </Popover>

      <select
        value={selectedHour}
        onChange={(e) => handleHourChange(e.target.value)}
        disabled={disabled}
        aria-label="Hora"
        className={selectClass}
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>

      <span className="text-sm font-semibold text-muted-foreground">:</span>

      <select
        value={selectedMinute}
        onChange={(e) => handleMinuteChange(e.target.value)}
        disabled={disabled}
        aria-label="Minutos"
        className={selectClass}
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </div>
  )
}
