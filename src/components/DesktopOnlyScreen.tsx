import { Monitor, Smartphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function DesktopOnlyScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full mx-auto shadow-lg">
        <CardContent className="p-8 text-center space-y-6">
          {/* Icon Section */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="p-3 bg-red-100 rounded-full">
              <Smartphone className="h-8 w-8 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-400">→</div>
            <div className="p-3 bg-green-100 rounded-full">
              <Monitor className="h-8 w-8 text-green-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Desktop Required
          </h1>

          {/* Message */}
          <div className="space-y-4 text-gray-600">
            <p className="text-lg">
              This driving school management system is designed for desktop use only.
            </p>
          </div>

          {/* Features that require desktop */}
          <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <p className="text-sm text-gray-500 font-medium"> Please open this application on a desktop or laptop computer for the best experience.</p>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Minimum screen width: 768px required
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 