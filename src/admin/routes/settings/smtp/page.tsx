import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Input,
  Label,
  Button,
  Switch,
  Text,
  toast,
} from "@medusajs/ui"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { sdk } from "../../../lib/sdk"

interface SmtpConfig {
  id?: string
  host: string
  port: number
  user: string
  pass: string
  from_email: string
  from_name: string
  secure: boolean
  enabled: boolean
}

const defaultConfig: SmtpConfig = {
  host: "",
  port: 587,
  user: "",
  pass: "",
  from_email: "",
  from_name: "",
  secure: false,
  enabled: true,
}

const SmtpSettingsPage = () => {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<SmtpConfig>(defaultConfig)
  const [testEmail, setTestEmail] = useState("")

  const { data, isLoading } = useQuery({
    queryFn: () =>
      sdk.client.fetch<{ smtp_config: SmtpConfig | null }>(
        "/admin/smtp-config"
      ),
    queryKey: ["smtp-config"],
  })

  useEffect(() => {
    if (data?.smtp_config) {
      const { id, created_at, updated_at, deleted_at, ...rest } = data.smtp_config as SmtpConfig & Record<string, unknown>
      setFormData({
        ...defaultConfig,
        ...rest,
        id,
        user: data.smtp_config.user || "",
        pass: data.smtp_config.pass || "",
        from_name: data.smtp_config.from_name || "",
      } as SmtpConfig)
    }
  }, [data])

  const saveMutation = useMutation({
    mutationFn: (payload: Omit<SmtpConfig, "id">) =>
      sdk.client.fetch<{ smtp_config: SmtpConfig }>("/admin/smtp-config", {
        method: "POST",
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smtp-config"] })
      toast.success("SMTP configuration saved")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save configuration")
    },
  })

  const testMutation = useMutation({
    mutationFn: () => {
      const { id, ...payload } = formData as SmtpConfig & Record<string, unknown>
      const { created_at, updated_at, deleted_at, ...cleanPayload } = payload as Record<string, unknown>
      return sdk.client.fetch("/admin/smtp-config", {
        method: "POST",
        body: cleanPayload,
      })
    },
    onSuccess: () => {
      toast.success("Configuration saved. Test email feature coming soon.")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send test email")
    },
  })

  const handleSave = () => {
    const { id, ...payload } = formData
    saveMutation.mutate(payload)
  }

  const handleTest = () => {
    if (!testEmail) {
      toast.error("Please enter a test email address")
      return
    }
    testMutation.mutate()
  }

  const updateField = (field: keyof SmtpConfig, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <Container className="p-0">
        <div className="flex items-center justify-center px-6 py-12">
          <Text className="text-ui-fg-subtle">Loading...</Text>
        </div>
      </Container>
    )
  }

  return (
    <Container className="p-0">
      <div className="px-6 py-4 border-b border-ui-border-base">
        <Heading level="h1">SMTP Settings</Heading>
        <Text size="small" className="text-ui-fg-subtle mt-1">
          Configure SMTP server for sending email notifications
        </Text>
      </div>

      <div className="px-6 py-4 flex flex-col gap-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-y-2">
            <Label size="small" weight="plus">
              Host *
            </Label>
            <Input
              placeholder="smtp.example.com"
              value={formData.host}
              onChange={(e) => updateField("host", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label size="small" weight="plus">
              Port *
            </Label>
            <Input
              type="number"
              placeholder="587"
              value={formData.port}
              onChange={(e) =>
                updateField("port", parseInt(e.target.value) || 0)
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-y-2">
            <Label size="small" weight="plus">
              User
            </Label>
            <Input
              placeholder="user@example.com"
              value={formData.user}
              onChange={(e) => updateField("user", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label size="small" weight="plus">
              Password
            </Label>
            <Input
              type="password"
              placeholder="********"
              value={formData.pass}
              onChange={(e) => updateField("pass", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-y-2">
            <Label size="small" weight="plus">
              From Email *
            </Label>
            <Input
              placeholder="noreply@example.com"
              value={formData.from_email}
              onChange={(e) => updateField("from_email", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label size="small" weight="plus">
              From Name
            </Label>
            <Input
              placeholder="My Store"
              value={formData.from_name}
              onChange={(e) => updateField("from_name", e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-x-6">
          <div className="flex items-center gap-x-2">
            <Switch
              checked={formData.secure}
              onCheckedChange={(checked) => updateField("secure", checked)}
            />
            <Label size="small" weight="plus">
              Secure (TLS)
            </Label>
          </div>
          <div className="flex items-center gap-x-2">
            <Switch
              checked={formData.enabled}
              onCheckedChange={(checked) => updateField("enabled", checked)}
            />
            <Label size="small" weight="plus">
              Enabled
            </Label>
          </div>
        </div>

        <div className="flex items-center gap-x-4 border-t border-ui-border-base pt-4">
          <div className="flex-1">
            <Input
              placeholder="test@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          <Button
            size="small"
            variant="secondary"
            onClick={handleTest}
            isLoading={testMutation.isPending}
            disabled={testMutation.isPending}
          >
            Send Test Email
          </Button>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-ui-border-base flex justify-end">
        <Button
          size="small"
          onClick={handleSave}
          isLoading={saveMutation.isPending}
          disabled={saveMutation.isPending}
        >
          Save
        </Button>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "SMTP",
})

export default SmtpSettingsPage
