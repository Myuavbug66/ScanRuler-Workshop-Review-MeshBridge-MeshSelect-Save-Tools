// SPDX-License-Identifier: AGPL-3.0-only
import { afterEach, expect, it } from 'vitest'
import { useTaskActivity } from '../../../src/state/taskActivity'
import { useDeleteSelection } from '../state/deleteStore'

afterEach(() => {
  useDeleteSelection.getState().reset()
  useTaskActivity.getState().setTask('other-work', null)
})

it('publishes numeric selection progress and clears it without clearing other tasks', () => {
  const deletion = useDeleteSelection.getState()
  useTaskActivity.getState().setTask('other-work', { text: 'Other task', percent: null })
  deletion.setProgress('Checking visible triangles: 42%', 42)
  expect(useDeleteSelection.getState().selecting).toBe(true)
  expect(useTaskActivity.getState().tasks['mesh-visible-selection']).toEqual({
    text: 'Checking visible triangles: 42%', percent: 42,
  })
  deletion.setProgress('Finding selection boundaries...')
  expect(useTaskActivity.getState().tasks['mesh-visible-selection'].percent).toBeNull()
  deletion.setProgress(null)
  expect(useDeleteSelection.getState().selecting).toBe(false)
  expect(useTaskActivity.getState().tasks).toEqual({ 'other-work': { text: 'Other task', percent: null } })
})

it('reset clears selection activity and retains the existing selection until reset', () => {
  const deletion = useDeleteSelection.getState()
  const mask = new Uint8Array([1, 0])
  deletion.setSelection(mask)
  deletion.setProgress('Preparing visibility checks...')
  expect(useTaskActivity.getState().tasks['mesh-visible-selection'].percent).toBeNull()
  deletion.setProgress(null)
  expect(useDeleteSelection.getState().selection).toBe(mask)
  deletion.setProgress('Checking visible triangles: 0%', 0)
  deletion.reset()
  expect(useTaskActivity.getState().tasks).toEqual({})
  expect(useDeleteSelection.getState().selection).toBeNull()
})
