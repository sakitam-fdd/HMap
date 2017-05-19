/**
 * Created by FDD on 2017/5/18.
 */
import { ol } from '../../constants'
const Event = ol.events.Event
class EditEvent extends Event {
  constructor (type, feature) {
    super()
    ol.events.Event.call(this, type)
    this.feature = feature
  }
}

EditEvent.EDIT_START = 'edit_start'
EditEvent.EDIT_END = 'edit_end'
EditEvent.ACTIVE_PLOT_CHANGE = 'active_plot_change'

export default EditEvent
