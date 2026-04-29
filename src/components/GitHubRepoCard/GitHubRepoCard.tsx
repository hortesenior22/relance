type GitHubRepoCardProps = {
  name?: string;
  description?: string;
  language?: string;
  stars?: number;
  forks?: number;
  url?: string;
};

export default function GitHubRepoCard({
  name = "mi-repo",
  description = "Descripción del repositorio",
  language = "JavaScript",
  stars = 0,
  forks = 0,
  url = "https://github.com/usuario/mi-repo",
}: GitHubRepoCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-gray-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>

        <svg
          className="h-5 w-5 text-gray-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.165c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.085 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.604-2.665-.304-5.466-1.334-5.466-5.931 0-1.31.468-2.381 1.235-3.221-.123-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.5 11.5 0 0 1 3.003-.404c1.018.005 2.042.138 3.003.404 2.292-1.552 3.298-1.23 3.298-1.23.653 1.653.241 2.873.118 3.176.77.84 1.233 1.911 1.233 3.221 0 4.609-2.804 5.625-5.475 5.921.43.372.823 1.102.823 2.222v3.293c0 .321.216.694.825.576C20.565 21.796 24 17.298 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
      </div>

      {/* Description */}
      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{description}</p>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span className="rounded-full bg-gray-100 px-2 py-1">{language}</span>

        <div className="flex gap-3">
          <span>⭐ {stars}</span>
          <span>🍴 {forks}</span>
        </div>
      </div>
    </a>
  );
}
type GitHubRepoCardProps = {
  name?: string;
  description?: string;
  language?: string;
  stars?: number;
  forks?: number;
  url?: string;
};

export default function GitHubRepoCard({
  name = "mi-repo",
  description = "Descripción del repositorio",
  language = "JavaScript",
  stars = 0,
  forks = 0,
  url = "https://github.com/usuario/mi-repo",
}: GitHubRepoCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-gray-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>

        <svg
          className="h-5 w-5 text-gray-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.165c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.085 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.604-2.665-.304-5.466-1.334-5.466-5.931 0-1.31.468-2.381 1.235-3.221-.123-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.5 11.5 0 0 1 3.003-.404c1.018.005 2.042.138 3.003.404 2.292-1.552 3.298-1.23 3.298-1.23.653 1.653.241 2.873.118 3.176.77.84 1.233 1.911 1.233 3.221 0 4.609-2.804 5.625-5.475 5.921.43.372.823 1.102.823 2.222v3.293c0 .321.216.694.825.576C20.565 21.796 24 17.298 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
      </div>

      {/* Description */}
      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{description}</p>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span className="rounded-full bg-gray-100 px-2 py-1">{language}</span>

        <div className="flex gap-3">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 640 640">
              <use href="/icons.svg#icon-star" />
            </svg>{" "}
            {stars}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 640 640">
              <use href="/icons.svg#icon-fork" />
            </svg>{" "}
            {forks}
          </span>
        </div>
      </div>
    </a>
  );
}
