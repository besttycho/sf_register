<?php

declare(strict_types=1);

/*
 * This file is developed by evoWeb.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 */

namespace Evoweb\SfRegister\Services\Event;

use TYPO3\CMS\Core\Mail\MailMessage;

final class PreSubmitMailEvent
{
    public function __construct(protected MailMessage $mail, protected array $settings, protected array $arguments = [])
    {
    }

    public function getMail(): MailMessage
    {
        return $this->mail;
    }

    public function getSettings(): array
    {
        return $this->settings;
    }

    public function getArguments(): array
    {
        return $this->arguments;
    }
}
