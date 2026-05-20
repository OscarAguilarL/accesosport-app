'use client'

import * as React from 'react'
import { format, parse, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

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

  const committedHours = selectedDate ? format(selectedDate, 'HH') : '00'
  const committedMinutes = selectedDate ? format(selectedDate, 'mm') : '00'

  // Draft state lets the user type freely; we only emit on blur
  const [draftHours, setDraftHours] = React.useState(committedHours)
  const [draftMinutes, setDraftMinutes] = React.useState(committedMinutes)

  // Keep drafts in sync when the external value changes (e.g. form reset)
  React.useEffect(() => {
    setDraftHours(committedHours)
    setDraftMinutes(committedMinutes)
  }, [committedHours, committedMinutes])

  function emitChange(date: Date | undefined, hh: string, mm: string) {
    if (!date) return
    const dateStr = format(date, 'yyyy-MM-dd')
    const h = String(Math.min(23, parseInt(hh || '0', 10))).padStart(2, '0')
    const m = String(Math.min(59, parseInt(mm || '0', 10))).padStart(2, '0')
    onChange(`${dateStr}T${h}:${m}`)
  }

  function handleDaySelect(date: Date | undefined) {
    emitChange(date, draftHours, draftMinutes)
  }

  function handleHoursBlur() {
    const clamped = String(Math.min(23, parseInt(draftHours || '0', 10))).padStart(2, '0')
    setDraftHours(clamped)
    emitChange(selectedDate, clamped, draftMinutes)
  }

  function handleMinutesBlur() {
    const clamped = String(Math.min(59, parseInt(draftMinutes || '0', 10))).padStart(2, '0')
    setDraftMinutes(clamped)
    emitChange(selectedDate, draftHours, clamped)
  }

  const displayLabel = selectedDate
    ? format(selectedDate, "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })
    : null

  const inputClass =
    'h-9 w-14 rounded-md border border-input bg-background px-2 text-center text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'

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
        />
        <div className="border-t px-4 py-3">
          <p className="mb-2 text-sm font-medium text-foreground">Hora</p>
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <label className="text-xs text-muted-foreground">HH</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={draftHours}
                onChange={e => setDraftHours(e.target.value.replace(/\D/g, ''))}
                onBlur={handleHoursBlur}
                onFocus={e => e.target.select()}
                className={inputClass}
              />
            </div>
            <span className="mt-5 text-lg font-semibold text-muted-foreground">:</span>
            <div className="flex flex-col items-center gap-1">
              <label className="text-xs text-muted-foreground">MM</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={draftMinutes}
                onChange={e => setDraftMinutes(e.target.value.replace(/\D/g, ''))}
                onBlur={handleMinutesBlur}
                onFocus={e => e.target.select()}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
