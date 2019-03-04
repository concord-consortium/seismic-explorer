import reducer from './index'

test('reducer initial test', () => {
  const state = reducer(undefined, {})
  expect(state).toBeDefined()
})
