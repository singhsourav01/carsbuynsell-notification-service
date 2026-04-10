import { NOTIFICATION_TEMPLATES } from "../constants/notification.constant";

class TemplateService {
  /**
   * Render a template string by replacing {{key}} placeholders with values
   */
  private renderTemplate = (template: string, data: Record<string, any>): string => {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return data[key] !== undefined ? String(data[key]) : `{{${key}}}`;
    });
  };

  /**
   * Get rendered title and body for a notification type
   */
  getRenderedTemplate = (
    type: keyof typeof NOTIFICATION_TEMPLATES,
    data: Record<string, any>
  ): { title: string; body: string } => {
    const template = NOTIFICATION_TEMPLATES[type];
    if (!template) {
      return { title: "Notification", body: "You have a new notification" };
    }

    return {
      title: this.renderTemplate(template.title, data),
      body: this.renderTemplate(template.body, data),
    };
  };
}

export default TemplateService;
