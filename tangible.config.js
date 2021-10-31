module.exports = {
  build: [
    {
      src: 'src/index.js',
      dest: 'build/app.min.js',
      watch: 'src/**',
      react: 'react'
    },
    {
      src: 'src/index.scss',
      dest: 'build/app.min.css',
      watch: 'src/**',
    },
  ],
  serve: {}
}
