program UpdatePreviousNeighborData
  implicit none

  type Individual
    integer :: data
    character(len=15) :: risk_profile
    character(len=15) :: interaction
    integer :: person_count
    character(len=3) :: symptoms_checked
    character(len=10) :: setting
    character(len=8) :: distance
    integer :: duration
    character(len=10) :: their_mask
    character(len=10) :: your_mask
    character(len=10) :: voice
  end type Individual

  ! Declare variables
  integer :: i
  integer, parameter :: n_instances = 1223237
  integer :: size
  type(Individual), allocatable :: instances(:)
  type(Individual), dimension(3) :: window
  integer :: prev_instance_data
  real :: start_time, end_time

  ! Allocate memory for instances
  allocate(instances(n_instances))

  ! Initialize instances
  do i = 1, n_instances
    instances(i)%data = 0
    instances(i)%risk_profile = "riskprofile"
    instances(i)%interaction = "interaction"
    instances(i)%person_count = 0
    instances(i)%symptoms_checked = "no"
    instances(i)%setting = "setting"
    instances(i)%distance = "distance"
    instances(i)%duration = 0
    instances(i)%their_mask = "their_mask"
    instances(i)%your_mask = "your_mask"
    instances(i)%voice = "voice"
  end do

  start_time = second()

  ! Create windows
  do i = 1, n_instances - 2
    window = [instances(i), instances(i+1), instances(i+2)]

    ! Process each window of three instances
    call compute_neighbor(window(2), prev_instance_data)
  end do

  end_time = second()

  ! Print size
  write(*, '(I0,A,F6.4)', advance="no") size, ",", end_time - start_time

contains

  subroutine compute_neighbor(current_instance, neighbor_data)
    type(Individual), intent(inout) :: current_instance
    integer, intent(in) :: neighbor_data

    if (neighbor_data == 0) then
      current_instance%data = 1
    else
      current_instance%data = 0
    end if

  end subroutine compute_neighbor

end program UpdatePreviousNeighborData
