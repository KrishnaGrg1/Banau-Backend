// components/dashboard/products/bulk-import-dialog.tsx
import { useState } from 'react'
import {
  Upload,
  FileSpreadsheet,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { useBulkImportProducts } from '@/hooks/use-product'
import { useForm } from '@tanstack/react-form'

interface BulkImportResult {
  success: number
  failed: number
  errors: { row: number; error: string; data: any }[]
}

export function BulkImportDialog() {
  const [open, setOpen] = useState(false)
  const [result, setResult] = useState<BulkImportResult | null>(null)
  const [filePreview, setFilePreview] = useState<{
    name: string
    size: number
  } | null>(null)

  const { mutateAsync, isPending } = useBulkImportProducts()

  const form = useForm({
    defaultValues: {
      file: undefined as File | undefined,
    },
    onSubmit: async ({ value }) => {
      if (!value.file) return
      //use client fn
      await mutateAsync({ file: value.file })
      //use of server function
      //  await mutateAsync({
      //   data: { file: value.file, filename: value.filename },
      // })
      setOpen(false)
    },
  })

  function makeFileHandler(fieldChange: (v: File | undefined) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]

      if (!file) {
        fieldChange(undefined)
        setFilePreview(null)
        return
      }

      const ext = file.name.split('.').pop()?.toLowerCase()
      if (!['csv', 'xlsx', 'xls'].includes(ext ?? '')) {
        alert('Only CSV or Excel files are supported')
        e.target.value = ''
        return
      }

      fieldChange(file) // ✅ store raw File
      setFilePreview({ name: file.name, size: file.size })
    }
  }

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => {
      form.reset()
      setFilePreview(null)
      setResult(null)
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Bulk Import
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Bulk Import Products</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to import multiple products at once.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-4 py-2"
        >
          {!result && (
            <form.Field name="file">
              {(field) => (
                // ✅ Same structure as AssetUpload
                <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
                  <Label
                    htmlFor="bulk-file"
                    className="text-sm font-medium text-foreground"
                  >
                    Import File
                  </Label>
                  <div className="flex items-start gap-4">
                    {/* Preview / placeholder */}
                    <div className="relative shrink-0">
                      {filePreview ? (
                        <>
                          <div className="h-20 w-20 rounded-xl border border-border bg-muted/50 flex flex-col items-center justify-center gap-1">
                            <FileSpreadsheet className="h-7 w-7 text-primary" />
                            <span className="text-[10px] text-muted-foreground text-center px-1 truncate w-full text-center">
                              {filePreview.name.split('.').pop()?.toUpperCase()}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              field.handleChange(undefined)
                              setFilePreview(null)
                              // form.setFieldValue('filename', '')
                            }}
                            className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-80 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </>
                      ) : (
                        <div className="h-20 w-20 rounded-xl border border-dashed border-border bg-muted/50 flex items-center justify-center">
                          <Upload className="h-7 w-7 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Input */}
                    <div className="flex-1 space-y-1.5">
                      {filePreview && (
                        <p className="text-[11px] text-primary font-medium">
                          ✓ {filePreview.name} (
                          {(filePreview.size / 1024).toFixed(1)} KB)
                        </p>
                      )}
                      <Input
                        id="bulk-file"
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={makeFileHandler(field.handleChange)}
                        className="cursor-pointer rounded-xl text-xs"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Supports CSV, XLS, XLSX — max 10MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </form.Field>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border bg-green-50 p-4 text-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-green-700">
                    {result.success}
                  </div>
                  <div className="text-xs text-green-600">Imported</div>
                </div>
                <div className="rounded-lg border bg-red-50 p-4 text-center">
                  <AlertCircle className="h-6 w-6 text-red-600 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-red-700">
                    {result.failed}
                  </div>
                  <div className="text-xs text-red-600">Failed</div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <p className="text-sm font-medium text-destructive">
                    Errors:
                  </p>
                  {result.errors.map((err, i) => (
                    <Alert key={i} variant="destructive" className="py-2">
                      <AlertDescription className="text-xs">
                        <span className="font-semibold">Row {err.row}:</span>{' '}
                        {err.error}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {result ? 'Close' : 'Cancel'}
            </Button>
            {!result && (
              <Button type="submit" disabled={!filePreview || isPending}>
                {isPending && <Spinner className="mr-2 h-4 w-4" />}
                {isPending ? 'Importing...' : 'Import'}
              </Button>
            )}
            {result && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setResult(null)
                  setFilePreview(null)
                  form.reset()
                }}
              >
                Import Another
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
