import { Badge } from "./ui/badge";

export const AppHeader = () => {
  return (
    <header className="mb-8 text-center" role="banner">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Mental AI Assistant
      </h1>
      <Badge variant="secondary" className="text-xs">
        தமிழ் (Tamil)
      </Badge>
      <p className="mt-3 text-sm text-gray-600 max-w-2xl mx-auto">
        Safe, compassionate mental health support with Tamil voice interaction.
      </p>
    </header>
  );
};
